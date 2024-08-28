import {
  ClickableDropdownArea,
  CustomDropdown,
  DropdownBodyContent,
  DropdownFaceContent,
} from '~/lib/organisms/CustomDropdown/CustomDropdown';

const items = [1, 2, 3, 4];

export const AssetDropdown = () => {
  return (
    <CustomDropdown>
      <ClickableDropdownArea>
        <DropdownFaceContent>
          <div className="flex items-center">
            <div className="text-body text-sand-500">Select type</div>
          </div>
        </DropdownFaceContent>
      </ClickableDropdownArea>
      <DropdownBodyContent position="right" topMargin={16}>
        {items.map((item) => (
          <button
            key={item}
            className="bg-background text-content text-body-xs py-3 px-4 text-left w-full hover:bg-dark-green-opacity"
          >
            Change account {item}
          </button>
        ))}
      </DropdownBodyContent>
    </CustomDropdown>
  );
};
