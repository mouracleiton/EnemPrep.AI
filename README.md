# ENEM Prep.AI - Flutter Version

This is the Flutter version of the ENEM Prep.AI application, designed to help students prepare for the ENEM (Exame Nacional do Ensino Médio) in Brazil.

## Features

- **Study Mode**: Practice with questions from previous ENEM exams
- **Statistics**: Track your performance and progress
- **Essay Evaluation**: Write and get feedback on your essays
- **Offline Access**: All content available offline
- **AI-Generated Lessons**: Explanations for each question

## Project Structure

- `lib/`: Main source code directory
  - `models/`: Data models
  - `screens/`: UI screens
  - `widgets/`: Reusable UI components
  - `services/`: Business logic and data services
  - `utils/`: Helper functions and utilities
  - `navigation/`: Navigation configuration
  - `theme/`: App theme and styling

## Getting Started

1. Install Flutter (https://flutter.dev/docs/get-started/install)
2. Clone this repository
3. Run the setup script: `./setup.sh`
4. Copy assets from the original project: `./copy_assets.sh`
5. Run the app: `./run.sh`

Alternatively, you can build the app for distribution using: `./build.sh`

## Data Structure

The app uses local JSON files for question data and images stored in the assets directory. The data structure follows the format used in the original app, with some optimizations for Flutter.

## Dependencies

- `flutter_markdown`: For rendering markdown content
- `fl_chart`: For statistics visualization
- `cached_network_image`: For image loading and caching
- `go_router`: For navigation
- `provider`: For state management
- `shared_preferences`: For local storage
- `crypto`: For data encryption/decryption

## Helper Scripts

The project includes several helper scripts to make development easier:

- `setup.sh`: Sets up the Flutter environment and installs dependencies
- `copy_assets.sh`: Copies assets from the original project to the Flutter project
- `run.sh`: Runs the Flutter app
- `build.sh`: Builds the app for distribution (Android, iOS, or Web)
- `fix_android.sh`: Fixes common Android configuration issues

Make sure to make these scripts executable with `chmod +x *.sh` before using them.

## Android Configuration

The Android configuration is located in the `android/` directory. If you encounter issues with the Android build, run the `fix_android.sh` script to fix common configuration issues.

See the [Android README](android/README.md) for more information about the Android configuration.

## License

This project is for educational purposes only. All ENEM content belongs to INEP (Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira).
