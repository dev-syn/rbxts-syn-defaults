import { UserInputService } from '@rbxts/services';

type OpenHandler = (menuId: string,node?: GuiObject) => void;

const triggers = new Map<string,Set<GuiObject>>();
const conns = new Map<GuiObject,RBXScriptConnection>();
const openHandlers = new Map<string,OpenHandler>();

export function registerTrigger(menuId: string,node?: GuiObject) {
	// Remove any previous recordings of this menu in the registry
	if (!node) {
		const triggerSet = triggers.get(menuId);
		if (triggerSet) {
			for (const trig of triggerSet) {
				const conn = conns.get(trig);
				if (conn) conn.Disconnect();
				conns.delete(trig);
			}
		}
		triggers.delete(menuId);
		return;
	}

	let triggerSet = triggers.get(menuId);
	if (!triggerSet) {
		triggerSet = new Set<GuiObject>();
		triggers.set(menuId,triggerSet);
	}

	if (!triggerSet.has(node)) {
		triggerSet.add(node);

		const conn = (node.InputBegan as RBXScriptSignal<(i: InputObject,p: boolean) => void>).Connect((input: InputObject,processed: boolean) => {
			if (processed) return;

			const preferredInput = UserInputService.PreferredInput;
			const inputType: Enum.UserInputType = input.UserInputType;
			const inputState: Enum.UserInputState = input.UserInputState;

			if (preferredInput === Enum.PreferredInput.KeyboardAndMouse) {
				if (inputType === Enum.UserInputType.MouseButton2)
					openHandlers.get(menuId)?.(menuId,node);
			} else if ((preferredInput === Enum.PreferredInput.Touch && inputType === Enum.UserInputType.Touch) || preferredInput === Enum.PreferredInput.Gamepad) {
				if (inputState === Enum.UserInputState.Begin)
					openHandlers.get(menuId)?.(menuId,node);
			}
		});
		conns.set(node,conn);
	}
}

export function unregisterTrigger(menuId: string, node?: GuiObject) {
  if (!node) {
    const triggerSet = triggers.get(menuId);
    if (!triggerSet) return;
    for (const trig of triggerSet) {
      const conn = conns.get(trig);
      if (conn) conn.Disconnect();
      conns.delete(trig);
    }
    triggers.delete(menuId);
    return;
  }

  const triggerSet = triggers.get(menuId);
  if (!triggerSet) return;
  if (triggerSet.has(node)) {
    const conn = conns.get(node);
    if (conn) conn.Disconnect();
    conns.delete(node);
    triggerSet.delete(node);
    if (triggerSet.size() === 0) triggers.delete(menuId);
  }
}

export function onOpenContextMenu(menuId: string, handler?: OpenHandler) {
  if (handler) openHandlers.set(menuId, handler);
  else openHandlers.delete(menuId);
}