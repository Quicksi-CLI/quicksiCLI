export async function getLatestVersion(): Promise<string> {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/Quicksi-CLI/quicksi-templates/main/VERSION"
    );

    if (!res.ok) {
      throw new Error("Failed to fetch VERSION");
    }

    const version = (await res.text()).trim();

    if (!version) {
      throw new Error("Empty VERSION file");
    }

    return version;
  } catch (err) {
    console.log("⚠️ Failed to fetch VERSION, falling back to main");
    return "main";
  }
};

