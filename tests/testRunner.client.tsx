import React, { StrictMode } from '@rbxts/react';
import { createPortal, createRoot } from '@rbxts/react-roblox';
import { App } from './App';
import { Players } from '@rbxts/services';

const folderRoot = new Instance("Folder");
folderRoot.Name = "ReactRoot";
const root = createRoot(folderRoot);

const playerGuiPromise = Promise.promisify(() => Players.LocalPlayer.WaitForChild("PlayerGui"))();
playerGuiPromise.then((inst) => {
	root.render(<StrictMode>{createPortal(<App/>,inst as PlayerGui,"ReactApp")}</StrictMode>);
})
.catch(() => {
	warn("The react app could not be mounted since the PlayerGui failed to be retrieved.");
});