import { IPlugin } from 'fbl';
import * as handlers from './src/handlers';

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
        new handlers.ClientCreateActionHandler(),
        new handlers.ClientDeleteActionHandler(),
        new handlers.ClientGetActionHandler(),
        new handlers.ClientUpdateActionHandler(),

        // client roles
        new handlers.ClientRoleCreateActionHandler(),
        new handlers.ClientRoleDeleteActionHandler(),
        new handlers.ClientRoleGetActionHandler(),
        new handlers.ClientRoleUpdateActionHandler(),

        // group
        new handlers.GroupCreateActionHandler(),
        new handlers.GroupDeleteActionHandler(),
        new handlers.GroupGetActionHandler(),
        new handlers.GroupUpdateActionHandler(),

        // group mappings roles
        new handlers.GroupGetRoleMappingsActionHandler(),

        // group mappings - realm roles
        new handlers.GroupAddRealmRoleMappingsActionHandler(),
        new handlers.GroupApplyRealmRoleMappingsActionHandler(),
        new handlers.GroupDeleteRealmRoleMappingsActionHandler(),

        // group mappings - client roles
        new handlers.GroupAddClientRoleMappingsActionHandler(),
        new handlers.GroupApplyClientRoleMappingsActionHandler(),
        new handlers.GroupDeleteClientRoleMappingsActionHandler(),

        // realm
        new handlers.RealmCreateActionHandler(),
        new handlers.RealmDeleteActionHandler(),
        new handlers.RealmGetActionHandler(),
        new handlers.RealmUpdateActionHandler(),

        // realm roles
        new handlers.RealmRoleCreateActionHandler(),
        new handlers.RealmRoleDeleteActionHandler(),
        new handlers.RealmRoleGetActionHandler(),
        new handlers.RealmRoleUpdateActionHandler(),

        // user
        new handlers.UserCreateActionHandler(),
        new handlers.UserDeleteActionHandler(),
        new handlers.UserGetActionHandler(),
        new handlers.UserUpdateActionHandler(),

        // user group mappings
        new handlers.UserAddToGroupActionHandler(),
        new handlers.UserDeleteFromGroupActionHandler(),
        new handlers.UserGetGroupsActionHandler(),
    ],

    templateUtils: [],
};
