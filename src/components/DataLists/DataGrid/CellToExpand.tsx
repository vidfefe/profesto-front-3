import { useState, useEffect, useRef, memo } from "react";
import Box from "@mui/material/Box";
import Tooltip from '@mui/material/Tooltip';
import { isOverflown } from "utils/common";

interface CellExpandProps {
    value: string;
    width: number;
    align?: string;
};

const CellExpand = memo(function CellExpand(props: CellExpandProps) {
    const { width, value, align } = props;
    const wrapper = useRef<HTMLDivElement | null>(null);
    const cellDiv = useRef(null);
    const cellValue = useRef(null);
    // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [showFullCell, setShowFullCell] = useState(false);
    const [showPopper, setShowPopper] = useState(false);

    const handleMouseEnter = () => {
        const isCurrentlyOverflown = isOverflown(cellValue.current!);
        setShowPopper(isCurrentlyOverflown);
        // setAnchorEl(cellDiv.current);
        setShowFullCell(true);
    };

    const handleMouseLeave = () => {
        setShowFullCell(false);
    };

    useEffect(() => {
        if (!showFullCell) {
            return undefined;
        };

        function handleKeyDown(nativeEvent: KeyboardEvent) {
            // IE11, Edge (prior to using Bink?) use 'Esc'
            if (nativeEvent.key === "Escape" || nativeEvent.key === "Esc") {
                setShowFullCell(false);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [setShowFullCell, showFullCell]);

    return (
        <Box
            ref={wrapper}
            sx={{
                alignItems: "center",
                lineHeight: "24px",
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                "& .cellValue": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                }
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                ref={cellDiv}
                style={{
                    height: 1,
                    width,
                    display: "block",
                    position: "absolute",
                    top: 0
                }}
            />
            {showPopper ? <Tooltip title={value} arrow><div ref={cellValue} className="cellValue">
                {value}
            </div>
            </Tooltip> : <div ref={cellValue} className="cellValue">
                {value}
            </div>}
        </Box>
    );
});

export function renderCellExpand(params: any) {
    return (
        <CellExpand
            value={params.formattedValue || params.value || ''}
            width={params.colDef.computedWidth}
            align={params.colDef.align}
        />
    );
}
