import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const runCommand = (command, args, cwd) => {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, cwd),
    });

    process.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

async function main() {
  try {
    console.log("Running init script...");
    await runCommand("bun", ["run", "init-script.ts"], "server");

    console.log("Starting client...");
    const client = spawn("bun", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, "client"),
    });

    console.log("Starting server...");
    const server = spawn("bun", ["run", "dev"], {
      stdio: "inherit",
      shell: true,
      cwd: join(__dirname, "server"),
    });

    process.on("SIGINT", () => {
      console.log("Stopping client and server...");
      client.kill();
      server.kill();
      process.exit();
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
