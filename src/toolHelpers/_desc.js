/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Return lean description in agent mode, full description in standalone mode.
 * @param {object} appContext  - the _appContext passed to every tool factory
 * @param {string} lean        - short description for agent mode (~3-6 lines)
 * @param {string} full        - full description for standalone mode
 */
export function desc(appContext, lean, full) {
  return (appContext && appContext.agent) ? lean : full;
}
