---
title: "02-Order App"
---

# Order App 

An web app in which you can order Deploy App instances for your troop, with X products served for your troops. Concept, not done yet.

### **Natural Language**

* Light-weight web-app, with a minimal backend proxy for KRAFTWERK requests
* Accessible to Clients at a known address via HTTPS
* Isolated in its own subnet (should be the default, actually)
* Accesses KRAFTWERK in another subnet via HTTPS
* No state to store

**Machine Readable**

```javascript
manifest:
    software:
        name: TILAUSPALVELU
        version: v1.0.0
        requires: KRAFTWERK
    outputs:
        - dns_name
    deployment:
        method: vm-small
        dns: tilaa.pvarki.fi
        network:
             externalIngress: tcp/443
             internalEgress:
                 - target: KRAFTWERK
                   port: tcp/443
```


* * * \

## Purpose

The purpose of PRODUCT is to 


1. purpose
2. purpose

## Users

Who uses this product? List Users. Refer to User Types. 

## Assumptions and Functional Requirements


1. List reqs & assumptions
2. List reqs & assumptions

## Technical Requirements

Write dependencies & constraints.

## Diagrams

## Links


## Purpose

The purpose of PRODUCT is to 


1. purpose
2. purpose

## Users

Who uses this product? List Users. Refer to User Types. 

## Assumptions and Functional Requirements


1. List reqs & assumptions
2. List reqs & assumptions

## Technical Requirements

Write dependencies & constraints.

## Diagrams

## Links
