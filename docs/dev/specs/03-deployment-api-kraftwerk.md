---
title: "03-Deployment API - Kraftwerk"
---

# Deployment API - Kraftwerk

Kraftwerk is a Deployment API that handles State of Deploy App instances. Called by Order App to create & destroy Deploy App instances. Calls Infra (IaC) to do state management

### **Natural Language**

* Light-weight infrastructure management service
* Accessible only in the Cloud environment, only via HTTPS, only with an API
* Accesses a Cloud Database, manages Cloud Infrastucture
* Isolated in its own subnet
* Stores application deployment and cloud infrastructure state

### **Machine Readable**

```javascript
manifest:
    software:
        id: kraftwerk-v1.0.0
        name: KRAFTWERK
        version: v1.0.0
        requires: NONE
    outputs:
        key: value
    deployment:
        method: vm-small
        network:
            internal
                ingress:
                    - source: TILAUSPALVELU
                      target: API
                      port: tcp/443 
                egress:
                    <These could be pre-defined keywords, similar to deployment.method options>
                    - target: RDBMS
                    - target: CLOUD
```

# Purpose

The purpose of Kraftwerk is to 


1. Accept manifests of Ordered Services from the Order App
2. Manage the state of Ordered Services according to orders from Order App.

# Users

A Stack operator is the primary user of Kraftwerk. Indirectly, users of services offered by operation of The Stack are Kraftwerk users.

# Assumptions and Functional Requirements


1. Order App will deliver a manifest that contains startdate, enddate and ordered products.
2. Order App expects an order confirmation and once order is brought online, link to the ordered Deploy App Server and an One-Time-Password to it.
3. Deploy App expects a manifest that contains startdate, enddate and ordered products and a Kraftwerk-signed JWT that lets Kraftwerk to generate OTPs on will. 
4. Deploy App will deliver a healthcheck endpoint that tells the state of each product, as well as endpoint to create OTPs authorized with JWTs.
5. Access to Deploy App OTP generation endpoint is not via a public network.

# Technical Requirements


1. You should know and store state securely.
2. You should know what IaC to refer to. Terraforms unless changed.
3. You are isolated into your own, not-public subnet only accessible by a legitimate Order App instance and one-way to Deploy App instances you manage. 

# Diagrams

# Links
