import { Players } from '@rbxts/services';
import { TOOLTIP_ROOT_ORDER } from './ToolTipRoot';

const CONTEXT_MENU_ROOT_NAME = "ROOT_CONTEXT_MENU";
export const CONTEXT_MENU_ROOT_ORDER = TOOLTIP_ROOT_ORDER - 100;

/** Gets or creates a root UI for ContextMenu with a 
 * DisplayOrder based from (ToolTipRoot.DisplayOrder - 100)
 */
function getOrCreateRootUI(): ScreenGui {
	const playerGui = Players.LocalPlayer?.WaitForChild("PlayerGui");
	if (!playerGui) throw error("Cannot find PlayerGui for the local player.");

	let rootUI = playerGui.FindFirstChild(CONTEXT_MENU_ROOT_NAME) as ScreenGui;
	if (rootUI && rootUI.IsA("ScreenGui")) return rootUI;

	rootUI = new Instance("ScreenGui");
	rootUI.Name = CONTEXT_MENU_ROOT_NAME;
	rootUI.ResetOnSpawn = false;
	rootUI.ZIndexBehavior = Enum.ZIndexBehavior.Global;
	rootUI.DisplayOrder = CONTEXT_MENU_ROOT_ORDER;

	rootUI.Parent = playerGui;
	return rootUI;
}

export const ContextMenuRoot = getOrCreateRootUI();