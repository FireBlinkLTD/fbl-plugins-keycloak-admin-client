# Realm Events Config

## Get Realm Events Config

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.events.config.get

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.events.config.get`
- `keycloak.realm.events.config.get`

### Example

```yaml
keycloak.realm.events.config.get:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [optional] Assign events config to the context
  # Follows common assign logic practices https://fbl.fireblink.com/plugins/common#assign-to
  assignEventsConfigTo: $.ctx.client

  # [optional] Push events config to the context
  # Follows common push logic practices https://fbl.fireblink.com/plugins/common#push-to
  pushEventsConfigTo: $.ctx.clients
```

## Update Realm Events Config

**ID:** com.fireblink.fbl.plugins.keycloak.admin.client.realm.events.config.update

**Aliases:**

- `fbl.plugins.keycloak.admin.client.realm.events.config.update`
- `keycloak.realm.events.config.update`

### Example

```yaml
keycloak.realm.events.config.update:
  # [required] Credentials to authenticate with, check ./Credentials.md for more information
  credentials: $ref:secrets.keycloak.credentials

  # [required] Realm name
  realmName: master

  # [required] Events config representation
  # All the fields can be checked in the official docs https://www.keycloak.org/docs-api/6.0/rest-api/index.html#_realmeventsconfigrepresentation
  config:
    eventsEnabled: true
    eventsListeners: ['jboss-logging']
```
