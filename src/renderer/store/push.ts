import { CollectionChain, ObjectChain } from "lodash";
import { getModule, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";

import db from "@src/utils/database";
import logger from "@src/utils/logger";

import store from "./index";

const pushLevelCollection = db.get("push.level") as ObjectChain<IPushLevel>;
const onebotTargetsCollection = db.get("push.onebotTargets") as CollectionChain<IOnebotTarget>;
const onebotCollection = db.get("push.onebot") as ObjectChain<IOnebotConf>;
const serverChanCollection = db.get("push.serverChan") as ObjectChain<IServerChan>;

@Module({
    namespaced: true,
    name: "push",
    store,
    dynamic: true,
})
export class PushModule extends VuexModule {
    onebotTargets: IOnebotTarget[] = [];
    pushLevel = pushLevelCollection.value();
    onebotConf = onebotCollection.value();
    serverChan = serverChanCollection.value();

    @Mutation
    updateItem() {
        db.set("push.onebotTargets", this.itemBuffer).write();
    }

    @Mutation
    getTasks() {
        // arrayLike并不能触发vue的reactive，必须是纯种array
        const onebotTargets = [...onebotTargetsCollection.value()];

        this.onebotTargets = onebotTargets;

        logger.info("更新Onebot推送目标");
    }

    action: "update" = "update";
    itemBuffer: IOnebotTarget[] = [] as IOnebotTarget[];
    ItemEditDialogVisibility: boolean = false;

    // enableItemEdit(option: { action: "create" }): void;
    enableItemEdit(option: { action: "update" }): void;
    @Mutation
    enableItemEdit({ action }: { action: "update" }) {
        this.action = action;

        this.itemBuffer = JSON.parse(JSON.stringify(this.onebotTargets));

        //显示修改对话框
        this.ItemEditDialogVisibility = true;
    }

    @Mutation
    cancelItemEdit() {
        this.ItemEditDialogVisibility = false;
    }

    @Mutation
    fakeTask(task: ITask) {
        // this.tasks = [task];
    }

    @Mutation
    updatePushLevel(fields: Partial<IPushLevel>) {
        const newPushLevel = { ...this.pushLevel, ...fields };

        this.pushLevel = newPushLevel;
        pushLevelCollection.assign(newPushLevel).write();
    }

    @Mutation
    updateOnebotConf(fields: Partial<IOnebotConf>) {
        const onebotConf = { ...this.onebotConf, ...fields };

        this.onebotConf = onebotConf;
        pushLevelCollection.assign(onebotConf).write();
    }

    @Mutation
    updateServerChan(fields: Partial<IServerChan>) {
        const serverChan = { ...this.serverChan, ...fields };

        this.serverChan = serverChan;
        pushLevelCollection.assign(serverChan).write();
    }
}

export default getModule(PushModule);
