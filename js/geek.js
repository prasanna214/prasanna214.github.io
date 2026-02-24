/* ================= TERMINAL ================= */

const term = new Terminal({
  cursorBlink: true,
  fontSize: window.innerWidth < 600 ? 14 : 16,
  fontFamily: "monospace",
  theme: {
    background: "transparent",
    foreground: "#00ff41",
  },
});

const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);

// Add WebLinksAddon to make URLs clickable
const webLinksAddon = new WebLinksAddon.WebLinksAddon();
term.loadAddon(webLinksAddon);

term.open(document.getElementById("terminal"));

// Ensure the terminal fits the container size
fitAddon.fit();
window.addEventListener("resize", () => {
  term.options.fontSize = window.innerWidth < 600 ? 14 : 16;
  fitAddon.fit();
});

/* ================= BOOT LOG ================= */

const bootLogs = [
  "[    0.000000 ] Linux version 6.1.0-wedding (gcc 13.2.0)",
  "[    0.000001 ] Command line: init=/sbin/systemd",
  "[    0.001313 ] ACPI: Power coupling stable. Dynamic load balance between nodes: perfectly synced.",
  "[    0.003313 ] systemd[1]: systemd 313 running in celebration mode.",
  "",
  "[    0.133313 ] systemd[1]: Starting compatibility-check.service...",
  "[    0.303313 ] compatibility-check[42]: Status: Beyond optimal. Synergy level: 100%.",
  "",
  "[    0.333313 ] compatibility-check[42]: \u001b[31m\u001b[5mWARNING:\u001b[0m Single status deprecated and marked for deletion ♥",
  "",
  "[    0.553313 ] systemd[1]: Starting engagement.service...",
  "[    0.883313 ] engagement.service: active (committed)",
  "",
  "[    1.030000 ] systemd[1]: Starting reception.service...",
  "[    1.030313 ] reception.service: Guests invited to Reception Ceremony.",
  "[    1.303313 ] systemd[1]: Startup finished successfully.",
  "",
];

let currentLine = 0;

function typeBoot() {
  if (currentLine < bootLogs.length) {
    term.writeln(bootLogs[currentLine]);
    currentLine++;
    setTimeout(typeBoot, 350);
  } else {
    startTerminal();
  }
}

setTimeout(typeBoot, 800);

/* ================= COMMAND SYSTEM ================= */

let input = "";
let history = [];
let historyIndex = -1;
let currentDir = "/";
let inputEnabled = true;

const fileContents = {
  "invite.txt":
    "You are invited to the Wedding Reception of\n\nPrasanna ❤️ Jaswanth\n\nWe would be honored by your presence.",
  "venue.txt":
    "Venue: SS Function Hall\nAddress: Ubalanka\nMap Link: https://maps.app.goo.gl/7WDtS5qKhP9vLoWbA",
  "schedule.txt": "Date: Sunday, 15th March\nTime: 11:00 AM",
  "dresscode.txt": "Dress Code: Traditional / Formal",
  "rsvp.txt":
    "Kindly confirm your presence at the following link:\nhttps://docs.google.com/forms/d/e/1FAIpQLSe7vhfodFpy264ff0j1lU_ma7Anygdblk1I6apoLtxE6Icw9w/viewform\n\nWe look forward to celebrating with you!",
};

function prompt() {
  if (!inputEnabled) return;
  const dirDisp = currentDir === "/" ? "~" : "~" + currentDir;
  term.write(`\r\nguest@login:${dirDisp}$ `);
}

function showHelp() {
  term.writeln("Available commands:");
  term.writeln("help        - Show available commands");
  term.writeln("ls          - List files");
  term.writeln("cat         - Read file");
  term.writeln("clear       - Clear screen");
}

function clearLine() {
  while (input.length > 0) {
    term.write("\b \b");
    input = input.slice(0, -1);
  }
}

function startTerminal() {
  const now = new Date();
  const timeString =
    now.toDateString() + " " + now.toTimeString().split(" ")[0];
  term.writeln(`Last login: ${timeString} on console`);
  term.writeln("");

  showHelp();
  prompt();

  term.attachCustomKeyEventHandler((ev) => {
    if (!inputEnabled) return false;

    // Prevent default tab behavior (losing focus)
    if (ev.key === "Tab") {
      if (ev.type === "keydown") {
        ev.preventDefault(); // Explicitly prevent default browser action
        handleAutocomplete();
      }
      return false; // Tell xterm to not process it further
    }

    if (ev.ctrlKey && ev.key === "c") {
      term.write("^C");
      input = "";
      prompt();
      return false;
    }

    // Ctrl+L or Cmd+K (mac) to clear terminal
    if ((ev.ctrlKey && ev.key === "l") || (ev.metaKey && ev.key === "k")) {
      // Only trigger on keydown to prevent double-firing
      if (ev.type === "keydown") {
        term.clear();
        // Move cursor to top left, clear screen entirely, then reprint prompt
        term.write("\x1bc"); // Full terminal reset sequence
        prompt();
        term.write(input);
      }
      return false;
    }

    return true;
  });

  function handleAutocomplete() {
    const commands = ["help", "ls", "cat", "clear"];
    const words = input.split(" ");
    const isCommand = words.length === 1;
    const word = words[words.length - 1];

    let matches = [];
    let prefix = word;

    if (isCommand) {
      matches = commands.filter((c) => c.startsWith(word));
    } else {
      let searchDir = currentDir;
      if (word.includes("/")) {
        const lastSlash = word.lastIndexOf("/");
        let dirPart = word.substring(0, lastSlash);
        prefix = word.substring(lastSlash + 1);

        if (dirPart === "" || dirPart === "~") {
          searchDir = "/";
        } else {
          searchDir =
            currentDir === "/" ? "/" + dirPart : currentDir + "/" + dirPart;
        }
        searchDir = searchDir.replace(/\/\//g, "/").replace(/\/$/, "");
        if (searchDir === "") searchDir = "/";
      }

      let options = [];
      if (searchDir === "/") {
        options = [
          "invite.txt",
          "venue.txt",
          "schedule.txt",
          "dresscode.txt",
          "rsvp.txt",
        ];
      }

      matches = options.filter((o) => o.startsWith(prefix));
    }

    if (matches.length > 0) {
      if (matches.length === 1) {
        const completion = matches[0].substring(prefix.length);
        input += completion;
        term.write(completion);
        if (!matches[0].endsWith("/")) {
          input += " ";
          term.write(" ");
        }
      } else {
        let common = matches[0];
        for (let i = 1; i < matches.length; i++) {
          while (!matches[i].startsWith(common)) {
            common = common.substring(0, common.length - 1);
          }
        }
        if (common.length > prefix.length) {
          const completion = common.substring(prefix.length);
          input += completion;
          term.write(completion);
        } else {
          term.write("\r\n" + matches.join("  "));
          prompt();
          term.write(input);
        }
      }
    }
  }

  term.onData((e) => {
    if (!inputEnabled) return;

    if (e === "\r") {
      term.write("\r\n");
      runCommand(input.trim());

      if (input.trim().length > 0) {
        history.push(input);
      }

      historyIndex = history.length;
      input = "";
      prompt();
      return;
    }

    if (e === "\u007F") {
      if (input.length > 0) {
        input = input.slice(0, -1);
        term.write("\b \b");
      }
      return;
    }

    if (e === "\x1b[A") {
      if (historyIndex > 0) {
        historyIndex--;
        clearLine();
        input = history[historyIndex] || "";
        term.write(input);
      }
      return;
    }

    if (e === "\x1b[B") {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        clearLine();
        input = history[historyIndex] || "";
        term.write(input);
      } else {
        historyIndex = history.length;
        clearLine();
        input = "";
      }
      return;
    }

    if (e.startsWith("\x1b")) return;

    input += e;
    term.write(e);
  });
}

function runCommand(cmd) {
  if (!cmd) return;
  const args = cmd.split(" ").filter(Boolean);
  const command = args[0].toLowerCase();

  switch (command) {
    case "help":
      showHelp();
      break;

    case "ls":
      let lsTarget = args[1];
      let lsPath = currentDir;
      if (lsTarget) {
        if (lsTarget === "/" || lsTarget === "~") {
          lsPath = "/";
        } else {
          lsPath =
            currentDir === "/" ? "/" + lsTarget : currentDir + "/" + lsTarget;
        }
        lsPath = lsPath.replace(/\/\//g, "/").replace(/\/$/, "");
      }

      if (lsPath === "" || lsPath === "/") {
        term.writeln(
          "invite.txt  venue.txt  schedule.txt  dresscode.txt  rsvp.txt",
        );
      } else {
        term.writeln(
          `ls: cannot access '${lsTarget}': No such file or directory`,
        );
      }
      break;

    case "cat":
      let file = args[1];
      if (!file) {
        term.writeln("cat: missing operand");
        break;
      }

      let fileName = file;
      // Strip leading slash if they try an absolute path like /invite.txt
      if (fileName.startsWith("/")) {
        fileName = fileName.substring(1);
      }

      if (fileContents[fileName]) {
        const lines = fileContents[fileName].split("\n");
        for (let line of lines) {
          term.writeln(line);
        }
      } else {
        term.writeln(`cat: ${file}: No such file or directory`);
      }
      break;

    case "clear":
      term.clear();
      term.write("\x1bc"); // Full terminal reset sequence
      break;

    default:
      term.writeln("Command not found. Type 'help'");
  }
}
