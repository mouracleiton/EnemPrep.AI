#!/usr/bin/env python3
"""
Script to generate personalized lessons for ENEM questions using vLLM.
This script processes the enem_data.json file, generates a lesson for each question,
and adds the lesson to the question's JSON structure.
"""

import json
import os
import time
import sys
import copy
from tqdm import tqdm
import torch
from vllm import LLM, SamplingParams

# Check if required packages are installed
required_packages = ['vllm', 'torch']
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
    print("sudo pacman -S python-vllm python-pytorch")
    print("\nDepois de instalar os pacotes, execute este script novamente.")
    sys.exit(1)

# Model configuration
MODEL_NAME = "unsloth/gemma-3-1b-it-bnb-4bit"  # or any other model compatible with vLLM
USE_GPU = torch.cuda.is_available()
TENSOR_PARALLEL_SIZE = 1  # Adjust based on number of GPUs available

def initialize_model():
    """Initialize the vLLM model."""
    try:
        print(f"Initializing model {MODEL_NAME}...")
        model = LLM(
            model=MODEL_NAME,
            tensor_parallel_size=TENSOR_PARALLEL_SIZE,
            trust_remote_code=True,
            dtype="float16" if USE_GPU else "float32",
        )
        print("Model initialized successfully!")
        return model
    except Exception as e:
        print(f"Error initializing model: {e}")
        sys.exit(1)

def generate_lesson_with_vllm(model, prompt, max_length=1000, temperature=0.7):
    """
    Generate a lesson using vLLM.

    Args:
        model: The vLLM model instance
        prompt (str): The prompt to send to the model
        max_length (int): Maximum length of the generated text
        temperature (float): Temperature for generation

    Returns:
        str: The generated lesson
    """
    try:
        # Configure sampling parameters
        sampling_params = SamplingParams(
            temperature=temperature,
            max_tokens=max_length,
            top_p=0.9,
            top_k=40,
        )

        # Format the prompt
        formatted_prompt = f"<start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n"

        # Generate response
        outputs = model.generate([formatted_prompt], sampling_params)
        response_text = outputs[0].outputs[0].text

        # Extract only the model's response if needed
        if "<end_of_turn>" in response_text:
            response_text = response_text.split("<end_of_turn>")[0].strip()

        return response_text
    except Exception as e:
        print(f"Error generating lesson with vLLM: {e}")
        return generate_fallback_lesson(prompt)

def generate_fallback_lesson(prompt):
    """Generate a fallback lesson when the model call fails."""
    # [Previous fallback lesson implementation remains the same]
    # ... [Keep the existing implementation]

def create_prompt_from_question(question):
    """Create a prompt based on the question data."""
    # [Previous prompt creation implementation remains the same]
    # ... [Keep the existing implementation]

def process_questions(model, data_file, output_file=None, batch_size=10, start_index=0,
                     verbose=False, save_interval=5):
    """Process questions from the JSON file using vLLM."""
    if output_file is None:
        base_name = os.path.splitext(data_file)[0]
        output_file = f"{base_name}_with_lessons_vllm.json"

    try:
        # Load and process data
        print(f"Loading data from {data_file}...")
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Find all questions
        questions = []
        def find_questions(obj, path=[]):
            if isinstance(obj, dict):
                if "title" in obj and "discipline" in obj:
                    questions.append((path.copy(), obj))
                for key, value in obj.items():
                    find_questions(value, path + [key])
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    find_questions(item, path + [i])

        find_questions(data)
        total_questions = len(questions)
        print(f"Found {total_questions} questions to process")

        # Process questions in batches
        processed_count = 0
        success_count = 0
        error_count = 0
        last_save_time = time.time()

        for i in tqdm(range(start_index, total_questions, batch_size)):
            batch_end = min(i + batch_size, total_questions)
            batch = questions[i:batch_end]
            
            # Process each question in the batch
            prompts = []
            for _, question in batch:
                if "lesson" not in question:
                    prompt = create_prompt_from_question(question)
                    prompts.append((question, prompt))

            if prompts:
                # Generate lessons for the batch
                for question, prompt in prompts:
                    try:
                        lesson = generate_lesson_with_vllm(model, prompt)
                        question["lesson"] = lesson
                        success_count += 1
                    except Exception as e:
                        print(f"Error processing question: {e}")
                        question["lesson"] = generate_fallback_lesson(prompt)
                        error_count += 1
                    processed_count += 1

            # Save progress periodically
            current_time = time.time()
            if current_time - last_save_time >= save_interval * 60:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                last_save_time = current_time
                print(f"\nProgress saved at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"Processed: {processed_count}/{total_questions}")
                print(f"Success: {success_count}, Errors: {error_count}")

        # Save final results
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("\nProcessing completed!")
        print(f"Total processed: {processed_count}/{total_questions}")
        print(f"Success: {success_count}, Errors: {error_count}")
        print(f"Results saved to: {output_file}")

    except Exception as e:
        print(f"An error occurred: {e}")
        if 'data' in locals():
            print("Saving current progress...")
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """Main function to run the script."""
    import argparse

    parser = argparse.ArgumentParser(description="Generate lessons for ENEM questions using vLLM")
    parser.add_argument("--file", default="enem_data.json", help="Path to the input JSON file")
    parser.add_argument("--output", default=None, help="Path to the output JSON file")
    parser.add_argument("--batch-size", type=int, default=10, help="Number of questions to process in each batch")
    parser.add_argument("--start-index", type=int, default=0, help="Index to start processing from")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--model", default=MODEL_NAME, help="Model name to use")
    parser.add_argument("--save-interval", type=int, default=5, help="How often to save progress in minutes")
    parser.add_argument("--tp-size", type=int, default=TENSOR_PARALLEL_SIZE, help="Tensor parallel size")

    args = parser.parse_args()

    # Initialize the model
    model = initialize_model()

    # Process questions
    process_questions(
        model=model,
        data_file=args.file,
        output_file=args.output,
        batch_size=args.batch_size,
        start_index=args.start_index,
        verbose=args.verbose,
        save_interval=args.save_interval
    )

if __name__ == "__main__":
    main()