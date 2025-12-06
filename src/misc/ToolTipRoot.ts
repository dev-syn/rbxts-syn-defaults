import { Players } from '@rbxts/services';

const TOOLTIP_ROOT_NAME = "ROOT_TOOLTIP";
export const TOOLTIP_ROOT_ORDER = 1800;

/** Gets or creates a root UI for ToolTip with a 
 * DisplayOrder based of 1800(designed to be placed on-top of other elements)
 */
function getOrCreateRootUI(): ScreenGui {
	const playerGui = Players.LocalPlayer?.WaitForChild("PlayerGui");
	if (!playerGui) throw error("Cannot find PlayerGui for the local player.");

	let rootUI = playerGui.FindFirstChild(TOOLTIP_ROOT_NAME) as ScreenGui;
	if (rootUI && rootUI.IsA("ScreenGui")) return rootUI;

	rootUI = new Instance("ScreenGui");
	rootUI.Name = TOOLTIP_ROOT_NAME;
	rootUI.ResetOnSpawn = false;
	rootUI.ZIndexBehavior = Enum.ZIndexBehavior.Global;
	rootUI.DisplayOrder = TOOLTIP_ROOT_ORDER;

	rootUI.Parent = playerGui;
	return rootUI;
}

export const ToolTipRoot = getOrCreateRootUI();