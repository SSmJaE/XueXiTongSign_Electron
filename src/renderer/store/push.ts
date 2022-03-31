import store from "./index";
import { getModule, Module, Mutation, MutationAction, VuexModule } from "vuex-module-decorators";
import db from "@src/utils/database";
import logger from "@src/utils/logger";
import { ObjectEntries } from "@src/utils/common";
import dayjs from "dayjs";

import dayOfYear from "dayjs/plugin/dayOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import { CollectionChain } from "lodash";
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

const tasksCollection = db.get("tasks");
const signedCollection = db.get("signedActivities");
const onebotCollection = db.get("push.onebot") as CollectionChain<IOnebotConf>;
const onebotTargetsCollection = db.get("push.onebot.targets") as CollectionChain<IOnebotTarget>;

const defaultTargetConfig: IOnebotTarget[] = [];

@Module({
    namespaced: true,
    name: "push",
    store,
    dynamic: true,
})
export class PushModule extends VuexModule {
    onebotTargets: IOnebotTarget[] = [];

    @Mutation
    updateItem() {
        db.set("push.onebot.targets", this.itemBuffer).write();
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
}

export default getModule(PushModule);
