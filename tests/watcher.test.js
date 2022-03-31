(async () => {
    const watcher = new Watcher();

    watcher.on("normal", () => {
        console.error("in normal callback");
    });

    const a = async () => {
        console.error("in normal async  callback");
        // await sleep(1000);
        console.error("in normal  async callback");
    };
    watcher.on("normal", a);
    console.error(watcher);

    await sleep(1000);

    watcher.emit("normal");
    watcher.off("normal", a);
    console.error(watcher);
    watcher.emit("normal");
})();
