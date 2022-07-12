import React, {useEffect, useMemo, useState} from 'react';
import './index.css';

type PopoverProps = {
    title?: string | React.ReactNode
    children: any
    visible: boolean
    width?: number
    height?: number
    onCancel?: () => void
    closable?: boolean
}

const Popover = (props: PopoverProps) => {

    const [isVisible, setIsVisible] = useState<boolean>(true)
    const {closable, title, children, onCancel, visible, width, height} = props

    // props hidden changes
    useEffect(() => {
        setIsVisible(visible)
    }, [visible])

    // custom height & width
    const modalStyle = useMemo(() => {
        const obj: any = {}
        if (width && width > 0) obj.width = width
        if (height && height > 0) obj.height = height
        return obj
    }, [width, height])


    return (
        <div onClick={() => setIsVisible(false)}
             className={`${!isVisible ? 'hidden' : ''} m-popover-mask w-screen h-screen`}>
            <div style={modalStyle}
                 className="m-popover-content"
                 onClick={(e) => e.stopPropagation()}
            >
                {}
                {(title || closable) && (
                    <div className={`flex ${title ? 'justify-between' : 'justify-end'} 
                    items-center h-8 w-full px-4 border`}>
                        {title && <div className="text-sm">{title}</div>}
                        {closable && (
                            <div
                                className='cursor-pointer text-sm'
                                onClick={() => {
                                    setIsVisible(false)
                                    if (onCancel) onCancel()
                                }}>
                                ×
                            </div>
                        )}
                    </div>
                )}
                <div className='p-4'>
                    {children}
                </div>
            </div>
        </div>
    )

}

export default Popover;
