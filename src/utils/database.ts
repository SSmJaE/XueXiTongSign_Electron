import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

const adapter = new FileSync<IDataBase>("db.json");
const db = low(adapter);
export default db;

// Set some defaults (required if your JSON file is empty)
db.defaults<IDataBase>({
    user: {
        uid: null,
        account: "",
        password: "",
        cookie: "",
        lastUpdateTime: new Date(),
        hasTakenGuide: false,
    },
    tasks: [],
    parsedUTC: {},
    signedActivities: [],
    watch: {
        interval: true,
        im: true,
    },
    push: {
        level: {
            onlySign: true,
            log: false,
            logLevel: "success",
        },
        onebot: {
            enable: false,
            address: "http://127.0.0.1/",
        },
        onebotTargets: [],
        serverChan: {
            enable: false,
        },
    },
}).write();

// Set a user using Lodash shorthand syntax
// db.set("user.name", "typicode").write();

// Increment count
// db.update("count", (n: number) => n + 1).write();
