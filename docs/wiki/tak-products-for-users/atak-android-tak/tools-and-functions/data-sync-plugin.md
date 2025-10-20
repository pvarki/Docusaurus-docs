---
title: "Data Sync -plugin"
---

## **Plugin Description**

The Data Synchronization plug-in is used to synchronize multiple ATAK devices involved in the same exercise or event. This plug-in requires TAK Server 1.3.3+. TAK Server stores all data for a "mission" in a server side database. Clients may subscribe to a mission to receive dynamic updates when a mission changes, or to synchronize data missed while a given device was disconnected.

The plug-in currently supports the following types of data:\n• Map Items (CoT data) - including markers, shapes, routes, etc.\n• Files - arbitrary files may be synchronized including images, GRGs, configuration files, etc.\n• Logs - Mission or Recce logs are timestamped events associated with the mission\n• Chat - A persistent mission chat room is associated with each mission

Arbitrary CoT/UIDs may be associated with a mission so that any updates to that CoT will be automatically synchronized with all client subscribers. The plug-in allows the user to export an entire mission to a mission package (zip file) for archiving or sharing data with other systems. Provides a dead reckoning navigation capability in a denied environment.

### Full Data Sync Plugin manual for ATAK

[ATAK_5.5.0_Data_Sync_SUM.pdf 2159971](/api/attachments.redirect?id=78413a2d-b46b-4349-98d0-a0d5cd87f903)
