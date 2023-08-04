import type { Collection } from "./type";
import { getCollectionList } from "./utils";

const { widget } = figma;
const { useSyncedState, useEffect, AutoLayout, Text } = widget;

function ColorChipWidget() {
    const [mode, setMode] = useSyncedState<string>("mode", "list"); // list, error, chip
    const [collectionList, setCollectionList] = useSyncedState<Collection[]>("collectionList", []);
    const [currentCollection, setCurrentCollection] = useSyncedState<Collection | null>("currentCollection", null);

    let structure;

    useEffect(() => {
        if (collectionList.length === 0) {
            const collectionList = figma.variables.getLocalVariableCollections();

            if (collectionList.length === 0) {
                setMode("error");
            } else {
                setMode("list");
                setCollectionList(getCollectionList(collectionList));
            }
        }
    });

    switch (mode) {
        case "chip":
            break;
        case "list":
            let collectionStructure = collectionList.map((item, i) => {
                return (
                    <AutoLayout
                        onClick={() => {
                            console.log(item);
                        }}
                        key={i}
                    >
                        <Text>{item.name}</Text>
                    </AutoLayout>
                );
            });

            structure = (
                <AutoLayout
                    width="hug-contents"
                    height="hug-contents"
                    direction="vertical"
                    spacing={16}
                    fill="#fff"
                    padding={{
                        vertical: 30,
                        horizontal: 20,
                    }}
                    effect={{
                        type: "drop-shadow",
                        color: { r: 0, g: 0, b: 0, a: 0 },
                        offset: { x: 0, y: 4 },
                        blur: 8,
                    }}
                >
                    <Text fontSize={14} fontWeight={700} fontFamily={"Inter"} fill="#333">
                        Choose Your Color Variables below.
                    </Text>

                    <AutoLayout>{collectionStructure}</AutoLayout>
                </AutoLayout>
            );
            break;
        default:
            structure = (
                <AutoLayout width="hug-contents" height="hug-contents" fill="#fff">
                    <Text>12313231</Text>
                </AutoLayout>
            );
    }

    return structure;
}

widget.register(ColorChipWidget);
