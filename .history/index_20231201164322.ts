for await (const val of Array.from({length: 25}).map((_, i) => i)) {
    const filename = `./${val + 1}.ts`;
    const file = Bun.file(filename);

    if(await file.exists()) continue;

    Bun.write(file, `console.log(${val})`);
}
