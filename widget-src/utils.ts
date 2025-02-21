import type { Collection, ChipItem, RGBA } from "./type";

export function getCollectionList(data: VariableCollection[], child: Variable[]): Promise<Collection[]> {
    const list: Collection[] = [];
    const colorChipList = child.filter((item) => item.resolvedType === "COLOR" && item.hiddenFromPublishing === false);
    const hasColorVariable = colorChipList.length > 0;
    const childChipLogic: Promise<boolean>[] = [];

    if (hasColorVariable === true) {
        let parentList: string[] = [];

        colorChipList.forEach((item) => {
            parentList.push(item.variableCollectionId);
        });

        parentList = [...new Set(parentList)];

        parentList.forEach((item: string) => {
            const collectionData = data.filter((row) => row.id === item)[0];
            const childList: { [key: string]: ChipItem[] } = {};

            collectionData.modes.forEach((mode) => {
                childList[mode.modeId] = [];
            });

            colorChipList.forEach(async (childItem) => {
                if (childItem.variableCollectionId === item) {
                    for (const [key, value] of Object.entries(childItem.valuesByMode)) {
                        const dataValue = value as any;

                        if (dataValue?.type !== undefined) {
                            childChipLogic.push(
                                new Promise(async (resolv) => {
                                    const originalChip = await figma.variables.getVariableByIdAsync(dataValue.id);

                                    if (originalChip !== null) {
                                        for (const [originKey, originValue] of Object.entries(originalChip.valuesByMode)) {
                                            const originDataValue = originValue as RGBA;

                                            childList[key].push({
                                                id: childItem.id,
                                                hiddenFromPublishing: childItem.hiddenFromPublishing,
                                                name: childItem.name,
                                                originName: originalChip.name,
                                                value: originDataValue as RGBA,
                                                type: "origin",
                                                hexValue: getHexValue(originDataValue),
                                                opacity: Math.round(originDataValue.a * 100),
                                                description: childItem.description,
                                            });
                                        }
                                    }
                                    resolv(true);
                                })
                            );
                        } else {
                            childList[key].push({
                                id: childItem.id,
                                hiddenFromPublishing: childItem.hiddenFromPublishing,
                                name: childItem.name,
                                originName: null,
                                value: value as RGBA,
                                type: "origin",
                                hexValue: getHexValue(value as RGBA),
                                opacity: Math.round(dataValue.a * 100),
                                description: childItem.description,
                            });
                        }
                    }
                }
            });

            list.push({
                id: collectionData.id,
                name: collectionData.name,
                modes: collectionData.modes,
                child: childList,
            });
        });
    }

    return Promise.all(childChipLogic).then(() => {
        return list;
    });
}

function getHexValue(value: RGBA): string {
    let hexList: string[] = [];

    hexList[0] = (Math.round(value.r * 255) | (1 << 8)).toString(16).slice(1);
    hexList[1] = (Math.round(value.g * 255) | (1 << 8)).toString(16).slice(1);
    hexList[2] = (Math.round(value.b * 255) | (1 << 8)).toString(16).slice(1);

    return hexList.join("");
}

export function sortChipListForGroup(list: ChipItem[]) {
    const finalList: ChipItem[][] = [];
    let data: { [key: string]: ChipItem[] } = {};

    list.forEach((chip: ChipItem) => {
        let value = chip.name.split("/");
        let group: string = "";

        if (value.length > 1) {
            group = value[0];
        } else {
            group = "etc";
        }

        if (data[group] === undefined) {
            data[group] = [];
        }

        data[group].push(chip);
    });

    for (const [key, value] of Object.entries(data)) {
        if (key !== "etc") {
            finalList.push(value);
        }
    }

    if (data.etc) {
        finalList.push(data.etc);
    }

    finalList.forEach((child: ChipItem[]) => {
        child.sort((a, b) => {
            if (a.name.length !== b.name.length) {
                if (a.name.length < b.name.length) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                if (b.name > a.name) {
                    return -1;
                } else if (b.name < a.name) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    });

    return finalList;
}

export async function setup({ setMode, setCollectionList }: { setMode: Function; setCollectionList: Function }) {
    figma.variables.getLocalVariableCollectionsAsync().then(async (collectionList) => {
        const vartiableList = await figma.variables.getLocalVariablesAsync();

        if (collectionList.length === 0 || vartiableList.length === 0) {
            setMode("error");
        } else {
            const list = await getCollectionList(collectionList, vartiableList);

            if (list.length === 0) {
                setMode("error");
            } else {
                setMode("list");
                setCollectionList(list);
            }
        }
    });
}
