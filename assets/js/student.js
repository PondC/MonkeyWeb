function daytoNum(day) {
    switch (day) {
        case 'sun':
            return 0;
        case 'mon':
            return 1;
        case 'tue':
            return 2;
        case 'wed':
            return 3;
        case 'thu':
            return 4;
        case 'fri':
            return 5;
        case 'sat':
            return 6
    }
}
function numtoDay(num) {
    switch (num) {
        case 0:
            return 'sun';
        case 1:
            return 'mon';
        case 2:
            return 'tue';
        case 3:
            return 'wed';
        case 4:
            return 'thu';
        case 5:
            return 'fri';
        case 6:
            return 'sat'
    }
}
function gradetoText(grade) {
    if (grade <= 6) {
        return "ประถม " + grade;
    } else {
        return "มัธยม " + (grade - 6);
    }
}
function fullHBname(name) {
    if (name === 'M') {
        return 'MATH'
    }
    if (name === 'PH') {
        return 'PHYSICS'
    }
}