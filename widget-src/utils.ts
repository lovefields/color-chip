import type { Collection } from "./type";

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
            const childList: Variable[] = [];

            colorChipList.forEach((child) => {
                if (child.variableCollectionId === item) {
                    console.log(child);
                    console.log(child.id);
                    console.log(child.description);
                    console.log(child.resolvedType);
                    console.log(child.hiddenFromPublishing);
                    console.log(child.name);
                    console.log(child.valuesByMode);
                    childList.push(child);
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
