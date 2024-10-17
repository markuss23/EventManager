import { useState } from "react";
import { DateRangePicker } from "react-date-range";

function CalendarView({startDate, endDate}) {
  const [selectionRange, setSelectionRange] = useState({
    startDate: startDate ? startDate : new Date(),
    endDate: endDate ? endDate : new Date(),
    key: "selection",
  });

  const handleSelect = (ranges) => {
    setSelectionRange({
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
      key: "selection",
    });
  };
  function render() {
    return (
        <DateRangePicker
        onChange={handleSelect}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={1}
        ranges={[selectionRange]}
        direction="horizontal"
        preventSnapRefocus={true}
        calendarFocus="backwards"
      />
    );
  }
  return render();
}

CalendarView.propTypes = {};

export default CalendarView;
