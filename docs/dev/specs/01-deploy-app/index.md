---
title: "01-Deploy App"
---

> https://github.com/pvarki/docker-rasenmaeher-integration

### **Natural Language**

* FastAPI (rmapi) backend with React frontend to add & manage users, and let users to access any services deployed with it at this ime.
* At v1 issues mTLS certificates to users using integrated CFSSL CA. mTLS validity checked via OCSP.
* Uses Keycloak (OIDC, LDAP) to deliver user list, roles & groups to products integrated to it & deployed with it at this time.
* Easy to deploy automatically on will using IaC.
  * Goal: Can be deployed with product X, Y and Z on will, and integrations of X, Y and Z can be developed independently by their developers & deployed on will by based on decision which integrations to enable this time. 
  * Right now (Deploy App v1) - deployments are made using an integration Docker Compose, which does hinder the goal "deploy integrations on will" as they need to be defined in Compose.

**Machine Readable**

```javascript
manifest:
    software:
        name: Deploy App
        version: Rolling
        requires: KRAFTWERK
    outputs:
        - server
```

## Purpose

The purpose of Deploy App is to 


1. Get SaaS to soldiers
2. Do that by letting them add & manage users using Deploy App
3. Decentralized, have one Deploy App server per user unit
4. Integrable, enable other teams to integrate their products to be used via a Deploy App identity (in a Deploy App instances

## Users

* Regular Soldiers / operators ===> (access SaaS using Deploy App)
* Unit Leaders, like squad, platoon, company and other lead roles ===> (access SaaS & add & manage their users' access)

## Assumptions and Functional Requirements


1. By maximum 30 minutes from absolute zero (nihil) to full use (users enrolled & ready to work).
2. Decentralization: avoid concentrations of critical data via fully separate servers between user groups.
3. Mission critical security & craft: It's easy to use and secure, due to we do quality.

## Technical Requirements

T1. 

## Links
