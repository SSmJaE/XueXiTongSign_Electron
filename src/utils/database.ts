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
    },
    tasks: [],
    parsedUTC: {},
    signedActivities: [],
}).write();

// Set a user using Lodash shorthand syntax
// db.set("user.name", "typicode").write();

// Increment count
// db.update("count", (n: number) => n + 1).write();
