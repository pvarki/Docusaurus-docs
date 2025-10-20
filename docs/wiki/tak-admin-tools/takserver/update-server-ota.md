---
title: "Update Server (OTA)"
---

Takserver has a feature to provide updates to ATAK applications and plugins with takserver connection. When users are connected to takserver with the service enabled, they can update and install applications and plugins from Plugins Tools (TAK Package Mgmt).


Currently PVARKI is providing ATAK -app and Data Sync -plugin for installing and updating.


There is a plan to have a portal for admin to update/add/remove the .apk files shared to clients but this function is not on the road map yet. List on some of the available plugins is @[Plugin list](../../tak-products-for-users/atak-android-tak/plugin-list).

### Current way of managing plugins inside Rasenmaeher

Admin need ssh root access to server!


Add .apk' to /tmp/update and run taktool pp, inside the folder. Move the folder to mapped location and fix permissions.

```javascript
cd /tmp/  
taktool pp
sudo cp -r update /opt/docker-rasenmaeher-integration/takserver/  
sudo chmod 755 /opt/docker-rasenmaeher-integration/takserver/update -R 
```

Restart takserver instance inside Rasenmaeher


### Preparing the needed files for Update folder

Needed files:

* APK -files
* product.infz file
  * zip file including product.inf file and the apk icons.


### Later on the roadmap / preliminary plan

Current idea is to have a webpage inside Rasenmaeher where you can manage the .apk files and upload new ones when needed. Taktool should be part of that so when there are changes in the files it would be run automatically or prompted to admin to run.
