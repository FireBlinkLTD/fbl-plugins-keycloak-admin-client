# FBL Plugins: Keycloak Admin Client

Manage Keycloak resources (realms, clients, roles, etc) inside your [FBL](https://fbl.fireblink.com) flows.

[![CircleCI](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-keycloak-admin-client.svg?style=svg)](https://circleci.com/gh/FireBlinkLTD/fbl-plugins-keycloak-admin-client)
[![Known Vulnerabilities](https://snyk.io/test/github/FireBlinkLTD/fbl-plugins-keycloak-admin-client/badge.svg)](https://snyk.io/test/github/FireBlinkLTD/fbl-plugins-keycloak-admin-client)
[![codecov](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-keycloak-admin-client/branch/master/graph/badge.svg)](https://codecov.io/gh/FireBlinkLTD/fbl-plugins-keycloak-admin-client)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/FireBlinkLTD/fbl-plugins-keycloak-admin-client.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/FireBlinkLTD/fbl-plugins-keycloak-admin-client/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/FireBlinkLTD/fbl-plugins-keycloak-admin-client.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/FireBlinkLTD/fbl-plugins-keycloak-admin-client/context:javascript)

## Purpose

[fbl](https://fbl.fireblink.com) is a **flow** automation tool. That generally means it can automate any kind of routine processes and allows to create some really complex combinations of actions.

Keycloak management for build automation pipelines might be tricky sometimes, especially due to limited import functionality. Current plugin helps to bypass some of that limitations and seamlessly integrate with other fbl flows.

## Integration

There are multiple ways how plugin can be integrated into your flow.

### package.json

This is the most recommended way. Create `package.json` next to your flow file with following content:

```json
{
  "name": "flow-name",
  "version": "1.0.0",
  "description": "",
  "scripts": {
    "fbl": "fbl"
  },
  "license": "UNLICENSED",
  "dependencies": {
    "@fbl-plguins/keycloak-admin-client": "1.1.2",
    "fbl": "1.10.0"
  }
}
```

Then you can install dependencies as any other node module `yarn install` depending on the package manager of your choice.

After that you can use `yarn fbl <args>` to execute your flow or even register a custom script inside "scripts".

### Global installation

`npm i -g @fbl-plugins/keycloak-admin-client`

### Register plugin to be accessible by fbl

- via cli: `fbl -p @fbl-plguins/keycloak-admin-client <args>`
- via flow:

```yaml
requires:
  fbl: '>=1.10.0 <2.0.0'
  plugins:
    '@fbl-plguins/keycloak-admin-client': '>=1.1.2'

pipeline:
  # your flow goes here
```

## Action Handlers

### Realm

- [Realm Management](docs/Realm.md)
- [Realm Role Management](docs/RealmRole.md)
- [Realm Events Config](docs/RealmEventsConfig.md)

### Client

- [Client Management](docs/Client.md)
- [Client Role Management](docs/ClientRole.md)
- [Client Secret](docs/ClientSecret.md)
- [Client Service Account Role Mappings](docs/ClientServiceAccountRoleMappings.md)

### Group

- [Group Management](docs/Group.md)
- [Group Role Mappings](docs/GroupRoleMappings.md)

### User

- [User Management](docs/User.md)
- [User Group Mappings](docs/UserGroupMappings.md)
- [User Role Mappings](docs/UserRoleMappings.md)
