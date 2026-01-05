#!/bin/bash
#
# Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
# 
# Requirement: KUBECONFIG must be set to point to the target cluster
# The namespace is assumed to be 'viya'
kubectl -n viya get secret sas-viya-ca-certificate-secret -o go-template='{{(index .data "ca.crt")}}' | base64 -d > $HOME/viyaCert/ca.pem
