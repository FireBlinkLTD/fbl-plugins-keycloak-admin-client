import { IPlugin } from 'fbl';
import {
    ClientCreateActionHandler,
    ClientDeleteActionHandler,
    ClientGetActionHandler,
    ClientUpdateActionHandler,
    RealmCreateActionHandler,
    RealmDeleteActionHandler,
    RealmGetActionHandler,
    RealmUpdateActionHandler,
} from './src/handlers';

const packageJson = require('../package.json');

module.exports = <IPlugin>{
    name: packageJson.name,

    description: `Plugin human readable description.`,

    tags: packageJson.keywords,

    version: packageJson.version,

    requires: {
        fbl: packageJson.peerDependencies.fbl,
        plugins: {
            // pluginId: '<0.0.1'
        },
        applications: [],
    },

    reporters: [],

    actionHandlers: [
        // client
        new ClientCreateActionHandler(),
        new ClientDeleteActionHandler(),
        new ClientGetActionHandler(),
        new ClientUpdateActionHandler(),

        // realm
        new RealmCreateActionHandler(),
        new RealmDeleteActionHandler(),
        new RealmGetActionHandler(),
        new RealmUpdateActionHandler(),
    ],

    templateUtils: [],
};
