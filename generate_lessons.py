#!/usr/bin/env python3
"""
Script to generate personalized lessons for ENEM questions using Gemma 3 model via Ollama.
This script processes the enem_data.json file, generates a lesson for each question,
and adds the lesson to the question's JSON structure.
"""

import json
import os
import time
import sys
import subprocess
import requests
import concurrent.futures
import copy
from tqdm import tqdm

# Check if required packages are installed
required_packages = ['requests']
missing_packages = []

for package in required_packages:
    try:
        __import__(package)
    except ImportError:
        missing_packages.append(package)

if missing_packages:
    print(f"\nERROR: Missing required packages: {', '.join(missing_packages)}")
    print("\nPor favor, instale os pacotes necessários manualmente usando um dos comandos abaixo:")
    print("\nOpção 1 (se você estiver usando um ambiente virtual):")
    print(f"pip install {' '.join(missing_packages)}")
    print("\nOpção 2 (se você estiver usando o pip do sistema):")
    print(f"pip3 install --user {' '.join(missing_packages)}")
    print("\nOpção 3 (se você estiver no Arch Linux):")
    print("sudo pacman -S python-requests")
    print("\nDepois de instalar os pacotes, execute este script novamente.")
    sys.exit(1)

# Ollama API configuration
OLLAMA_API_BASE = "http://localhost:11434/api"
MODEL_NAME = "gemma3:1b"

# GPU configuration
USE_GPU = True
GPU_LAYERS = -1  # -1 means use all available layers on GPU

# Check if Ollama is running and the model is available
print("Checking Ollama service and model availability...")
try:
    response = requests.get(f"{OLLAMA_API_BASE}/tags")
    if response.status_code != 200:
        print("Error: Could not connect to Ollama API. Make sure Ollama is running.")
        print("You can start Ollama with: ollama serve")
        sys.exit(1)

    models_data = response.json()
    models = models_data.get("models", [])
    model_available = any(model.get("name") == MODEL_NAME for model in models)

    if not model_available:
        print(f"Warning: Model {MODEL_NAME} not found in Ollama.")
        print(f"You can pull it with: ollama pull {MODEL_NAME}")
        pull = input("Do you want to pull the model now? (y/n): ")
        if pull.lower() == 'y':
            print(f"Pulling model {MODEL_NAME}...")
            subprocess.run(["ollama", "pull", MODEL_NAME], check=True)
            print("Model pulled successfully!")
        else:
            print("Please pull the model manually and run this script again.")
            sys.exit(1)
    else:
        print(f"Model {MODEL_NAME} is available!")

    # Check GPU availability
    if USE_GPU:
        try:
            # Get Ollama system information
            response = requests.get(f"{OLLAMA_API_BASE}/version")
            if response.status_code == 200:
                version_info = response.json()
                if "cuda" in str(version_info).lower():
                    print("CUDA is available for Ollama!")
                    print(f"CUDA Version: {version_info.get('cuda', 'Unknown')}")
                else:
                    print("Warning: CUDA not detected in Ollama. Will try to use GPU anyway.")
            else:
                print("Warning: Could not check CUDA availability. Will try to use GPU anyway.")
        except Exception as e:
            print(f"Warning: Error checking GPU availability: {e}. Will try to use GPU anyway.")

except requests.RequestException as e:
    print(f"Error connecting to Ollama API: {e}")
    print("Make sure Ollama is running with: ollama serve")
    sys.exit(1)

def generate_lesson_with_gemma(prompt, max_length=1000, temperature=0.7):
    """
    Generate a lesson using Gemma 3 model via Ollama API.

    Args:
        prompt (str): The prompt to send to the model
        max_length (int): Maximum length of the generated text
        temperature (float): Temperature for generation

    Returns:
        str: The generated lesson
    """
    try:
        # Format the prompt for Gemma 3 instruct model
        formatted_prompt = f"<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n"

        # Prepare the API request
        url = f"{OLLAMA_API_BASE}/generate"
        payload = {
            "model": MODEL_NAME,
            "prompt": formatted_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_length,
                "num_gpu": GPU_LAYERS if USE_GPU else 0,  # Use GPU layers if enabled
                "num_thread": 8,  # Optimize thread usage
                "mirostat": 0,  # Disable mirostat sampling for faster generation
                "top_k": 40,  # Limit vocabulary to top 40 tokens
                "top_p": 0.9  # Sample from top 90% probability mass
            }
        }

        # Make the API request
        response = requests.post(url, json=payload)
        response.raise_for_status()

        # Extract the response text
        result = response.json()
        response_text = result.get("response", "")

        # Extract only the model's response if needed
        if "<end_of_turn>" in response_text:
            response_text = response_text.split("<end_of_turn>")[0].strip()

        return response_text
    except Exception as e:
        print(f"Error generating lesson with Ollama: {e}")
        return generate_fallback_lesson(prompt)

def generate_fallback_lesson(prompt):
    """
    Generate a fallback lesson when the API call fails.

    Args:
        prompt (str): The original prompt

    Returns:
        str: A generic lesson based on the question
    """
    # Extract key information from the prompt
    lines = prompt.split('\n')
    title = ""
    discipline = ""

    for line in lines:
        if "Título:" in line:
            title = line.replace("Título:", "").strip()
        elif "Disciplina:" in line:
            discipline = line.replace("Disciplina:", "").strip()

    # Generate a simple fallback lesson
    return f"""
Aula sobre: {title}

Esta é uma aula sobre um tema relacionado à disciplina de {discipline}.
A questão aborda conceitos importantes para o ENEM.

Pontos principais a serem estudados:
1. Revise os conceitos básicos relacionados a este tema em seu livro didático.
2. Pratique exercícios similares para reforçar o aprendizado.
3. Consulte seu professor para esclarecer dúvidas específicas sobre este conteúdo.

Nota: Esta é uma aula genérica gerada automaticamente devido a uma falha na geração da aula personalizada.
"""

def create_prompt_from_question(question):
    """
    Create a prompt for the Gemma 3 model based on the question data.

    Args:
        question (dict): The question data

    Returns:
        str: The prompt for the model
    """
    discipline = question.get("discipline", "")
    discipline_label = ""

    # Map discipline value to label
    if discipline == "ciencias-humanas":
        discipline_label = "Ciências Humanas e suas Tecnologias"
    elif discipline == "ciencias-natureza":
        discipline_label = "Ciências da Natureza e suas Tecnologias"
    elif discipline == "linguagens":
        discipline_label = "Linguagens, Códigos e suas Tecnologias"
    elif discipline == "matematica":
        discipline_label = "Matemática e suas Tecnologias"

    # Get the correct alternative
    correct_alt = question.get("correctAlternative", "")
    correct_alt_text = ""

    if correct_alt:
        for alt in question.get("alternatives", []):
            if alt.get("letter") == correct_alt:
                correct_alt_text = alt.get("text", "")
                break

    # Create the prompt
    prompt = f"""
Título: {question.get('title', '')}
Disciplina: {discipline_label}
Ano: {question.get('year', '')}
Contexto: {question.get('context', '')}
Enunciado: {question.get('alternativesIntroduction', '')}
Alternativa correta: {correct_alt} - {correct_alt_text}

Com base nesta questão do ENEM, crie uma aula personalizada para alunos do ensino médio que explique os conceitos necessários para compreender e resolver esta questão. A aula deve ser clara, concisa e educativa, usando linguagem acessível para estudantes do ensino médio.
"""
    return prompt

def find_questions_in_json(data):
    """
    Find questions in the JSON data, handling different possible structures.

    Args:
        data (dict): The loaded JSON data

    Returns:
        list: A list of tuples (parent_object, question_object)
    """
    all_questions = []

    # Check if questions are directly in the exams
    for exam in data.get("exams", []):
        if "questions" in exam:
            for question in exam.get("questions", []):
                all_questions.append((exam, question))

    # If no questions found, try to find them at the root level
    if not all_questions and "questions" in data:
        # Check if questions is a dictionary with years as keys
        if isinstance(data.get("questions"), dict):
            for year, questions_list in data.get("questions", {}).items():
                if isinstance(questions_list, list):
                    for question in questions_list:
                        all_questions.append((data, question))
        # Otherwise, assume it's a list
        elif isinstance(data.get("questions"), list):
            for question in data.get("questions", []):
                all_questions.append((data, question))

    # If still no questions, search for them in a nested structure
    if not all_questions:
        for exam in data.get("exams", []):
            for discipline in exam.get("disciplines", []):
                discipline_value = discipline.get("value")
                if discipline_value and discipline_value in exam:
                    for question in exam.get(discipline_value, []):
                        all_questions.append((exam, question))

    return all_questions

def save_checkpoint(checkpoint_file, current_index, total_questions, processed_count, success_count, error_count):
    """
    Save a checkpoint with the current progress.

    Args:
        checkpoint_file (str): Path to the checkpoint file
        current_index (int): Current question index
        total_questions (int): Total number of questions
        processed_count (int): Number of questions processed
        success_count (int): Number of successful generations
        error_count (int): Number of errors
    """
    checkpoint = {
        "last_processed_index": current_index,
        "total_questions": total_questions,
        "processed_count": processed_count,
        "success_count": success_count,
        "error_count": error_count,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    with open(checkpoint_file, 'w', encoding='utf-8') as f:
        json.dump(checkpoint, f, ensure_ascii=False, indent=2)

def load_checkpoint(checkpoint_file):
    """
    Load a checkpoint with the current progress.

    Args:
        checkpoint_file (str): Path to the checkpoint file

    Returns:
        dict: The checkpoint data or None if the file doesn't exist
    """
    try:
        with open(checkpoint_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None

def process_question(args):
    """
    Process a single question and generate a lesson for it.

    Args:
        args (tuple): A tuple containing (question_index, question, total_questions, verbose)

    Returns:
        tuple: (question_index, question, success)
    """
    question_index, question, total_questions, verbose = args

    # Skip if the question already has a lesson
    if "lesson" in question:
        print(f"Question {question_index+1}/{total_questions} already has a lesson. Skipping.")
        return question_index, question, False

    print(f"Processing question {question_index+1}/{total_questions}: {question.get('title', '')}")

    # Create prompt and call API
    prompt = create_prompt_from_question(question)
    if verbose:
        print(f"Prompt:\n{prompt}")

    try:
        lesson = generate_lesson_with_gemma(prompt)

        # Add the lesson to the question
        question["lesson"] = lesson

        if verbose:
            print(f"Generated lesson:\n{lesson[:200]}...")

        print(f"Successfully generated lesson for question {question_index+1}")
        return question_index, question, True
    except Exception as e:
        print(f"Failed to generate lesson for question {question_index+1}: {e}")
        # Use fallback
        question["lesson"] = generate_fallback_lesson(prompt)
        print(f"Used fallback lesson for question {question_index+1}")
        return question_index, question, False

def process_questions(data_file, output_file=None, batch_size=10, start_index=0, verbose=False,
                     delay=0.5, auto_resume=False, no_checkpoint=False, max_workers=4,
                     save_interval=5):
    """
    Process questions from the JSON file, generate lessons, and save to a new file.

    Args:
        data_file (str): Path to the input JSON file
        output_file (str): Path to the output JSON file (if None, will be auto-generated)
        batch_size (int): Number of questions to process in each batch
        start_index (int): Index to start processing from
        verbose (bool): Whether to print verbose output
        delay (float): Delay between API calls in seconds
        auto_resume (bool): Whether to automatically resume from checkpoint
        no_checkpoint (bool): Whether to ignore existing checkpoint
        max_workers (int): Maximum number of parallel workers
        save_interval (int): How often to save progress (in minutes)
    """
    # Generate output file name if not provided
    if output_file is None:
        base_name = os.path.splitext(data_file)[0]
        output_file = f"{base_name}_with_lessons.json"

    # Define checkpoint file path
    checkpoint_file = f"{os.path.splitext(output_file)[0]}_checkpoint.json"

    # Check if checkpoint exists
    if not no_checkpoint:
        checkpoint = load_checkpoint(checkpoint_file)
        if checkpoint and start_index == 0:
            last_index = checkpoint.get("last_processed_index", 0)
            print(f"Found checkpoint: Last processed index was {last_index}")
            print(f"Progress: {checkpoint.get('processed_count', 0)}/{checkpoint.get('total_questions', 0)} questions processed")
            print(f"Success: {checkpoint.get('success_count', 0)}, Errors: {checkpoint.get('error_count', 0)}")
            print(f"Timestamp: {checkpoint.get('timestamp', '')}")

            if auto_resume:
                start_index = last_index + 1
                print(f"Automatically resuming from index {start_index}")
            else:
                response = input("Do you want to resume from this checkpoint? (y/n): ")
                if response.lower() == 'y':
                    start_index = last_index + 1
                    print(f"Resuming from index {start_index}")

    try:
        # Initialize counters
        processed_count = 0
        success_count = 0
        error_count = 0
        last_save_time = time.time()

        # Load the JSON data
        print(f"Loading data from {data_file}...")
        with open(data_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)

        # Create a deep copy for the output data
        data = copy.deepcopy(input_data)

        # Find questions in the JSON data
        all_questions = find_questions_in_json(data)

        total_questions = len(all_questions)
        print(f"Total questions found: {total_questions}")

        if total_questions == 0:
            print("No questions found in the JSON file. Please check the structure.")
            return

        # Adjust start_index if it's out of range
        if start_index >= total_questions:
            print(f"Start index {start_index} is out of range. Setting to 0.")
            start_index = 0

        # Process questions in batches with parallel execution
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            for i in tqdm(range(start_index, total_questions, batch_size), desc="Processing batches"):
                batch_end = min(i + batch_size, total_questions)
                batch_processed = 0

                # Prepare batch of questions for parallel processing
                batch_args = []
                for j in range(i, batch_end):
                    _, question = all_questions[j]
                    batch_args.append((j, question, total_questions, verbose))

                # Process batch in parallel
                futures = [executor.submit(process_question, args) for args in batch_args]

                # Collect results
                for future in concurrent.futures.as_completed(futures):
                    try:
                        question_index, question, success = future.result()
                        processed_count += 1
                        batch_processed += 1

                        if success:
                            success_count += 1
                        else:
                            error_count += 1

                        # Save checkpoint after each question
                        save_checkpoint(checkpoint_file, question_index, total_questions,
                                       processed_count, success_count, error_count)

                        # Add a delay to avoid rate limiting if needed
                        if delay > 0:
                            time.sleep(delay)
                    except Exception as e:
                        print(f"Error processing question: {e}")
                        error_count += 1

                # Save progress periodically or after each batch
                current_time = time.time()
                time_since_last_save = current_time - last_save_time

                if batch_processed > 0 and (time_since_last_save >= save_interval * 60 or i + batch_size >= total_questions):
                    # Save the updated data
                    print(f"Saving data to {output_file}...")
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)

                    last_save_time = current_time
                    print(f"Saved progress at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                    print(f"Batch {i//batch_size + 1}/{(total_questions + batch_size - 1)//batch_size} completed")
                    print(f"Progress: {processed_count}/{total_questions} questions processed")
                    print(f"Success: {success_count}, Errors: {error_count}")

        print("All questions processed successfully!")
        print(f"Final stats: {processed_count}/{total_questions} questions processed")
        print(f"Success: {success_count}, Errors: {error_count}")
        print(f"Output saved to: {output_file}")

        # Remove checkpoint file if all questions are processed
        if os.path.exists(checkpoint_file) and processed_count == total_questions:
            os.remove(checkpoint_file)
            print("Checkpoint file removed as all questions have been processed.")

    except KeyboardInterrupt:
        print("\nProcess interrupted by user.")
        print(f"Progress saved. You can resume from index {start_index + processed_count}.")

        # Save current progress before exiting
        if 'data' in locals():
            print(f"Saving current state to {output_file}...")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("Saved current state before exiting")
        return

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        # Save the current state in case of error
        try:
            if 'data' in locals():
                print(f"Saving current state to {output_file}...")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print("Saved current state before exiting")
            else:
                print("No data to save")
        except Exception as save_error:
            print(f"Failed to save current state: {save_error}")

def main():
    """Main function to run the script."""
    import argparse

    # Declare globals at the beginning of the function
    global MODEL_NAME, OLLAMA_API_BASE, USE_GPU, GPU_LAYERS

    parser = argparse.ArgumentParser(description="Generate lessons for ENEM questions using Gemma 3 model via Ollama")
    parser.add_argument("--file", default="enem_data.json", help="Path to the input JSON file")
    parser.add_argument("--output", default=None, help="Path to the output JSON file (default: input_file_with_lessons.json)")
    parser.add_argument("--batch-size", type=int, default=10, help="Number of questions to process in each batch")
    parser.add_argument("--start-index", type=int, default=0, help="Index to start processing from")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--test", action="store_true", help="Test Gemma 3 model via Ollama")
    parser.add_argument("--resume", action="store_true", help="Automatically resume from checkpoint without asking")
    parser.add_argument("--no-checkpoint", action="store_true", help="Ignore existing checkpoint and start from beginning")
    parser.add_argument("--delay", type=float, default=0.5, help="Delay between model calls in seconds (default: 0.5)")
    parser.add_argument("--model", default=MODEL_NAME, help=f"Ollama model name to use (default: {MODEL_NAME})")
    parser.add_argument("--api-base", default=OLLAMA_API_BASE, help=f"Ollama API base URL (default: {OLLAMA_API_BASE})")
    parser.add_argument("--workers", type=int, default=4, help="Number of parallel workers (default: 4)")
    parser.add_argument("--save-interval", type=int, default=5, help="How often to save progress in minutes (default: 5)")
    parser.add_argument("--gpu", action="store_true", default=USE_GPU, help="Use GPU acceleration (default: enabled if available)")
    parser.add_argument("--no-gpu", action="store_false", dest="gpu", help="Disable GPU acceleration")
    parser.add_argument("--gpu-layers", type=int, default=GPU_LAYERS, help="Number of layers to offload to GPU (-1 for all layers)")

    args = parser.parse_args()

    # Update global variables if command line arguments are provided

    if args.model != MODEL_NAME:
        MODEL_NAME = args.model
    if args.api_base != OLLAMA_API_BASE:
        OLLAMA_API_BASE = args.api_base

    # Update GPU settings
    USE_GPU = args.gpu
    GPU_LAYERS = args.gpu_layers

    if USE_GPU:
        print(f"GPU acceleration enabled with {GPU_LAYERS if GPU_LAYERS > 0 else 'all'} layers")
    else:
        print("GPU acceleration disabled, using CPU only")

    if args.test:
        print(f"Testing Gemma 3 model via Ollama ({MODEL_NAME})...")
        try:
            test_prompt = "Create a short lesson about the importance of reading."
            response = generate_lesson_with_gemma(test_prompt)
            print("Model test successful! Here's the response:")
            print("-" * 50)
            print(response)
            print("-" * 50)
            return
        except Exception as e:
            print(f"Model test failed: {e}")
            return

    # No need to check for checkpoint here as it's handled in process_questions

    print(f"Starting to process questions from {args.file}")
    process_questions(
        data_file=args.file,
        output_file=args.output,
        batch_size=args.batch_size,
        start_index=args.start_index,
        verbose=args.verbose,
        delay=args.delay,
        auto_resume=args.resume,
        no_checkpoint=args.no_checkpoint,
        max_workers=args.workers,
        save_interval=args.save_interval
    )

if __name__ == "__main__":
    main()
