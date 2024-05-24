import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useState  } from "react";
import ArrowDown from '~/icons/chevron-down.svg?react';
import ArrowUp from '~/icons/chevron-up.svg?react';

export default function MenuMulti({
  choose = 'Select...',
  onSelectDefault = null,
  items,
}: {
  choose?: string;
  onSelectDefault?: any;
  items: any[];
}) {

  const [storedResult, setStoredResult] = useState<any>(choose); 

  return (
      <Menu as="div" className="">
        {({ open }) => (
          <>
            <div>
              <Menu.Button className={`w-full flex p-3 justify-start items-center bg-transparent border border-divider rounded-lg ${ open ? '' : ''}`}>

                {/* Show selections or choose */}
                {
                  // If no result or isFocused, show the search box.
                  !storedResult ? 
                    <span className="flex items-center w-full">
                      {choose}
                    </span>
                  : 
                    // Else show the multiple results.
                    <span className="flex items-center w-full">
                      {storedResult}
                    </span>
                }
                { open ? <ArrowUp /> : <ArrowDown />}
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items style={{top: 'calc(100% + 4px)'}} className="absolute right-0 z-50 origin-top-right w-full eq-dropdown-menu max-h-36 mt-0 overflow-y-auto">
                {
                  items.map(row => (
                    <div key={row.text || row || ''} className="">
                      <Menu.Item>
                        <a
                          href="#"
                          // If no specific select handler for this row, use the global handler. both calls with "text", by default it stores the result in text.
                          onClick={(event) => {(row.onSelect ? row.onSelect : ( onSelectDefault ? onSelectDefault : setStoredResult))(row.text || row || ''); event.preventDefault()}}
                          className="eq-dropdown-item"
                        >
                          <span className="me-auto">{row.text || row || ''}</span>
                        </a>
                      </Menu.Item>
                    </div>
                  ))
                }
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
  );
}

