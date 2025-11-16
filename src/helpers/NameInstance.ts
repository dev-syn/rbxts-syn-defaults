import React from '@rbxts/react';

interface NameInstanceProps{
	name: string;
	inst: React.ReactElement;
}

export function NameInstance({ name, inst }: NameInstanceProps) {
	return React.cloneElement(inst,{
		ref: (_inst: Instance | undefined) => {
			if (_inst) _inst.Name = name;
		}
	});
}