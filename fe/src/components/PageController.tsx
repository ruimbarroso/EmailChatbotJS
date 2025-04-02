import React, { useCallback, useEffect, useState } from "react";
import { useEmailManager } from "../contexts/Contexts";

export const PageController = () => {
    const { getSelectedEmailBox, selectedPage, loadBoxEmails } = useEmailManager();

    const [pages, setPage] = useState(-1);
    useEffect(() => {
        const box = getSelectedEmailBox();

        if (box != null) {
            setPage(Math.ceil(box.NumMessages / 10));
        }

    }, [getSelectedEmailBox]);
    const buildOnClickFunc = useCallback((page: number) => {
        return () => {
            console.log(`Previous: ${selectedPage} Page: ${page}`)
            const box = getSelectedEmailBox();
            if (!box || page <= 0 || page > pages || page === selectedPage) return;

            loadBoxEmails(box, page, 10);
        }
    }, [getSelectedEmailBox, pages, selectedPage, loadBoxEmails]);

    const buildController = useCallback(() => {
        const controllerOptions = [];

        controllerOptions.push(controllerOption('<', buildOnClickFunc(selectedPage - 1)));


        if (pages - selectedPage <= 4) {
            for (let i = pages - 4; i <= pages; i++) {
                controllerOptions.push(controllerOption(i.toString(), buildOnClickFunc(i), i === selectedPage));
            }
        } else {
            for (let i = 0; i < 5 && i + selectedPage < pages; i++) {

                if (i === 4 && pages > 5) {
                    controllerOptions.push(controllerOption(pages.toString(), buildOnClickFunc(pages)));
                } else if (i === 3 && pages > 5) {
                    controllerOptions.push(controllerOption('...', () => { }));
                } else if (i === 0) {
                    controllerOptions.push(controllerOption((selectedPage + i).toString(), buildOnClickFunc(selectedPage + i), true));
                }
                else {
                    controllerOptions.push(controllerOption((selectedPage + i).toString(), buildOnClickFunc(selectedPage + i)));
                }
            }
        }



        controllerOptions.push(controllerOption('>', buildOnClickFunc(selectedPage + 1)));

        return (
            <div className="flex justify-around w-50">
                {controllerOptions}
            </div>
        );
    }, [pages, selectedPage, buildOnClickFunc]);

    return buildController();
};

const controllerOption = (text: string, onClick: () => void, isSelected: boolean = false) => {
    return <div key={text} className={`${isSelected ? "text-blue-500" : "text-white"} w-8 h-8 flex items-center justify-center rounded-4xl hover:bg-[#101010] cursor-pointer`}
        onClick={onClick}>{text}</div>
};