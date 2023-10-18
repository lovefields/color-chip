import type { Collection, ChipItem, RGBA } from "./type";

export function getCollectionList(data: VariableCollection[], child: Variable[]): Collection[] {
    const list: Collection[] = [];
    const colorChipList = child.filter((item) => item.resolvedType === "COLOR" && item.hiddenFromPublishing === false);
    const hasColorVariable = colorChipList.length > 0;

    if (hasColorVariable === true) {
        let parentList: string[] = [];

        colorChipList.forEach((item) => {
            parentList.push(item.variableCollectionId);
        });

        parentList = [...new Set(parentList)];

        parentList.forEach((item) => {
            const collectionData = data.filter((row) => row.id === item)[0];
            const childList: { [key: string]: ChipItem[] } = {};

            collectionData.modes.forEach((mode) => {
                childList[mode.modeId] = [];
            });

            console.log(childList);

            colorChipList.forEach((childItem) => {
                if (childItem.variableCollectionId === item) {
                    for (const [key, value] of Object.entries(childItem.valuesByMode)) {
                        const dataValue = value as any;

                        if (dataValue?.type !== undefined) {
                            console.log("other chip");
                            // TODO : 값 추출해서 넣기
                        } else {
                            childList[key].push({
                                id: childItem.id,
                                hiddenFromPublishing: childItem.hiddenFromPublishing,
                                name: childItem.name,
                                originName: null,
                                value: value as RGBA,
                                type: "origin",
                                hashValue: getHexValue(value as RGBA),
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

    return list;
}

function getHexValue(value: RGBA) {
    console.log(value);
    // var a, isPercent,
    // rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    // alpha = (rgb && rgb[4] || "").trim(),
    // hex = rgb ?
    // (rgb[1] | 1 << 8).toString(16).slice(1) +
    // (rgb[2] | 1 << 8).toString(16).slice(1) +
    // (rgb[3] | 1 << 8).toString(16).slice(1) : orig;
  
    // if (alpha !== "") { a = alpha; }
    // else { a = 01; }
    // hex = hex + a;
  
    // return hex;
    return "";
}
