import { GardistoOptions, LogLevel } from "./types";
import { createLogger } from "./logger";
import { getAllJSAndTSFiles } from "./fileUtils";
import { processFiles } from "./envVariableChecker";
import path from 'path';

// Function to handle and display the results of the environment variable check
export const handleResults = (errors: any[], warnings: any[], errorCount: number): void => {
  // Display warnings if any
  if (warnings.length > 0) {
    console.warn("Warnings for environment variables:");
    warnings.forEach((warning) => {
      const message = warning.toString().split('\n')[0]; // Only take the first line (the message)
      console.warn(message);
    });
    console.warn(); // Add blank line for readability
  }

  // Display errors if any, and exit the process with an error code
  if (errorCount > 0) {
    console.error("Errors found in environment variables:");
    errors.forEach((error) => {
      const message = error.toString().split('\n')[0]; // Only take the first line (the message)
      console.error(message);
    });
    console.error(); // Add blank line for readability
    process.exit(1); // Exit with error code
  } else if (warnings.length === 0) {
    // If no errors or warnings, display a success message
    console.log("No environment variable issues found.");
  }
};

// Main function to run the environment variable check
export const gardisto = (options: GardistoOptions = {}): void => {
  // Create a logger based on the debug option
  const log = createLogger(options.debug ?? false);

  // Determine the project path (use current working directory if not specified)
  const projectPath = options.projectPath ?? process.cwd();
  const absoluteProjectPath = path.resolve(projectPath);

  log(LogLevel.INFO, `Checking environment variables in project path: ${absoluteProjectPath}`);

  // Get all JavaScript and TypeScript files in the project
  const files = getAllJSAndTSFiles(
    absoluteProjectPath,
    log,
    options.include as Array<`*.${string}`> ?? [],
    options.exclude as Array<`*.${string}`> ?? []
  );
  log(LogLevel.INFO, `Processing ${files.length} JS/TS files`);

  // Process the files and check for environment variable issues
  const { errors, warnings, errorCount } = processFiles(
    files,
    log,
    options.showDefaultValues ?? false
  );

  // Handle and display the results
  handleResults(errors, warnings, errorCount);
};
