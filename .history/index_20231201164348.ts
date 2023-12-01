// Create 25 files with task for each file
for await (const val of Array.from({length: 25}).map((_, i) => i + 1)) {
    const filename = `./${val}.ts`;
    const file = Bun.file(filename);

    if(await file.exists()) continue;

    Bun.write(file, `console.log(${val})`);
}
