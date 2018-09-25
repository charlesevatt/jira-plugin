import * as path from 'path';
import * as vscode from 'vscode';
import state from '../state/state';
import { getConfigurationByKey, getGlobalCounter, setGlobalCounter } from './configuration';
import { CONFIG, DEFAULT_WORKING_ISSUE_STATUS, LATER, NO, STATUS_ICONS, YES } from './constants';

// generate icon + status
export const addStatusIcon = (status: string, withDescription: boolean): string => {
  let icon = STATUS_ICONS.DEFAULT.icon;
  if (!!status) {
    Object.values(STATUS_ICONS).forEach(value => {
      if (status.toUpperCase().indexOf(value.text.toUpperCase()) !== -1) {
        icon = value.icon;
      }
    });
  }
  return `${icon}` + (withDescription ? `  ${status} ` : ``);
};

export const getIconsPath = (fileName: string): string => {
  return path.join(__filename, '..', '..', '..', '..', 'images', 'icons', fileName);
};

export const secondsToHHMMSS = (sec: number): string => {
  let hours = Math.floor(sec / 3600);
  let minutes = Math.floor((sec - hours * 3600) / 60);
  let seconds = sec - hours * 3600 - minutes * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const secondsToMinutes = (sec: number): number => {
  return Math.floor(sec / 60);
};

export const workingIssueStatuses = (): string => {
  let statusList = (getConfigurationByKey(CONFIG.WORKING_ISSUE_STATUSES) || DEFAULT_WORKING_ISSUE_STATUS)
    .split(',')
    .map((status: string) => status.trim())
    .filter((status: string) => state.statuses.some(stateStatus => stateStatus.name.toLowerCase() === status.toLowerCase()));
  return statusList && statusList.length > 0
    ? statusList.reduce((a: string, b: string) => (a === '' ? a + `'${b}'` : `${a},'${b}'`), '')
    : `'${DEFAULT_WORKING_ISSUE_STATUS}'`;
};

export const checkCounter = async (): Promise<void> => {
  const count = getGlobalCounter(state.context) || 0;
  if (count !== -1) {
    if (count % 20 === 0 && count > 0) {
      let action = await vscode.window.showInformationMessage(`Star Jira Plugin on GitHub?`, YES, LATER, NO);
      switch (action) {
        case NO: {
          setGlobalCounter(state.context, -1);
          break;
        }
        case YES: {
          vscode.commands.executeCommand('jira-plugin.openGitHubRepoCommand');
          setGlobalCounter(state.context, -1);
          break;
        }
        default:
          setGlobalCounter(state.context, count + 1);
      }
    } else {
      setGlobalCounter(state.context, count + 1);
    }
  }
};
