import * as coreCommand from '@actions/core/lib/command'

// Based on https://github.com/actions/checkout/blob/b2e6b7ed13bcde9d37c9e3e6967cd3ecfd2807ad/src/state-helper.ts

/**
 * Indicates whether the POST action is running
 */
export const IsPost = !!process.env['STATE_isPost']

// Publish a variable so that when the POST action runs, it can determine it should run the cleanup logic.
// This is necessary since we don't have a separate entry point.
if (!IsPost) {
  coreCommand.issueCommand('save-state', {name: 'isPost'}, 'true')
}
