import store from "./index";
import { getModule, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import db from "@src/utils/database";
import logger from "@src/utils/logger";

const userCollection = db.get("user");
const watchCollection = db.get("watch");

@Module({
    namespaced: true,
    name: "user",
    store,
    dynamic: true,
})
export class UserModule extends VuexModule {
    user: IUser = userCollection.value();
    watchMethod: IWatchMethod = watchCollection.value();

    @Mutation
    updateUser(fields: Partial<IUser>) {
        const newUser = { ...this.user, ...fields };

        this.user = newUser;
        userCollection.assign(newUser).write();
    }

    @Mutation
    updateWatchMethod(fields: Partial<IWatchMethod>) {
        const newWatchMethod = { ...this.watchMethod, ...fields };

        this.watchMethod = newWatchMethod;
        watchCollection.assign(newWatchMethod).write();
    }
}

export default getModule(UserModule);
