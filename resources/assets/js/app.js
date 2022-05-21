//Note: If this ever comes from an untrusted source, you have to sanitize the input
import { translations } from './translations';
import { isInViewport, isMobile, throttle, debounce } from './utils';
import { registerTouchStart, registerMouseHandlers, getDirection, UP, DOWN } from './mouse';

(() => {

    let animalStatsIndex = 0;

    let sectionInViewport = {
        element: null,
        index: null
    };
    let screenIndex = 0;

    const screenContentElements = document.querySelectorAll(".screen-content");
    const squares = [
        { key: "farmedAnimals", numberOnASide: 2, color: "blue" },
        { key: "wildBirds", numberOnASide: 5, color: "blue" },
        { key: "wildAnimals", numberOnASide: 10, color: "blue" },
        { key: "reptiles", numberOnASide: 10, color: "green" },
        { key: "amphibians", numberOnASide: 10, color: "green" },
        { key: "fish", numberOnASide: 10, color: "orange" },
        { key: "earthworms", numberOnASide: 30, color: "pink" },
        { key: "arthropods", numberOnASide: 50, color: "purple" },
    ];

    const addText = (element, language = "en") => {
        const { translateId } = element.dataset;
        if (!translateId) { console.error('data-translate-id elements must have an attribute value'); return; }
        
        const textToAdd = translations[language][translateId];
        if (!translateId) { console.error(`no translation provided for ${translateId} in ${language}`); return; }

        element.innerHTML = textToAdd;
    };

    const loadText = () => {
        const elementsToTranslate = document.querySelectorAll("[data-translate-id]");
        elementsToTranslate.forEach((element) => {
            addText(element);
        });
    };

    const addSquares = (numberOnASide, color = "blue", icons) => {
        
        const removeChildren = (element) => {

            var child = element.lastElementChild;
            while (child) {
                element.removeChild(child);
                child = element.lastElementChild;
            }
        };

        const squaresContainer = document.getElementById("centered-squares");
        removeChildren(squaresContainer);
        squaresContainer.className = `square-${numberOnASide}s`;
        for (let index = 0; index < numberOnASide*numberOnASide; index++) {
            const element = document.createElement("div");
            element.className = `${color}-square`;
            squaresContainer.appendChild(element);
        }

    };

    const isLastAnimalStat = () => {
        return animalStatsIndex === (squares.length - 1);
    };

    const isFirstAnimalStat = () => {
        return animalStatsIndex === 0;
    };

    const modAnimalStat = () => {
        animalStatsIndex = (animalStatsIndex+1) % squares.length;
    };

    const updateAnimalStats = () => {

        const domesticStatsElement = document.querySelector("div.domestic-stats-container");
        const wildStatsElement = document.querySelector("div.wild-stats-container");
        const wildAnimalStatsElements = document.querySelectorAll("p.animal-stat");

        //show domesticated; hide wild
        if (animalStatsIndex === 0) {
            wildStatsElement.classList.add("hidden");
            domesticStatsElement.classList.remove("hidden");
        }

        //show wild; hide domesticated; show specific wild
        if (animalStatsIndex !== 0) {
            domesticStatsElement.classList.add("hidden");
            wildStatsElement.classList.remove("hidden");
            wildAnimalStatsElements.forEach((element) => {
                element.classList.add("hidden");
            });
            wildAnimalStatsElements[animalStatsIndex - 1].classList.remove("hidden");
        }

    };

    const canMovePastWildAnimalStats = (event) => {

        const isLastAnimalStatScreen = isLastAnimalStat();
        const isFirstAnimalStatScreen = isFirstAnimalStat();
        const direction = getDirection(event);

        return (isLastAnimalStatScreen && direction === DOWN) || (isFirstAnimalStatScreen && direction === UP);
    };

    document.querySelector(".animal-stats").addEventListener("wheel", function (event) {

        //if is mobile and last of the animal stats isn't loaded, don't load the next screen
        const isDeviceMobile = isMobile();
        const movingPastAnimalStats = canMovePastWildAnimalStats(event);

        if (isDeviceMobile) { return false; }

        if (!movingPastAnimalStats) {
            throttle(updateAnimalStatsOnMouseEvent, 500);
        }
        if (movingPastAnimalStats) {

            event.preventDefault();
            event.stopPropagation();
            throttle(updateAnimalStatsOnMouseEvent, 500);
            return false; // handled by the touchstart event
        }

    }, { passive: false });

    document.querySelector(".animal-stats").addEventListener("touchstart", function (event) {

        const movingPastAnimalStats = canMovePastWildAnimalStats(event);
        if (!movingPastAnimalStats) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }

    }, { passive: false });


    document.querySelector(".animal-stats").addEventListener("touchmove", function (event) {
        //if is mobile and last of the animal stats isn't loaded, load the next animal stat
        const isDeviceMobile = isMobile();
        const movingPastAnimalStats = canMovePastWildAnimalStats(event);

        if (!isDeviceMobile) { return false; }

        if (!movingPastAnimalStats) {
            event.preventDefault();
            event.stopPropagation();
            throttle(updateAnimalStatsOnMouseEvent, 500);
            return false;
        }
        if (movingPastAnimalStats) {
            //reset the screen back to mod-0
            throttle(updateAnimalStatsOnMouseEvent, 2000);
        }

    }, { passive: false });
    
    
    const updateAnimalStatsOnMouseEvent = (event) => {

        const isLastAnimalStatScreen = isLastAnimalStat();

        modAnimalStat();
        loadAnimalTextStats();
        if (isLastAnimalStatScreen) { updateSectionInViewport(); }
        updateAnimalStats();
        if (isLastAnimalStatScreen) { updatePageIndicatorDots(); }
    };

    const updateSectionInViewport = () => {
        const index = [...screenContentElements].findIndex((sectionElement, index) => {
            return isInViewport(sectionElement);
        });
        sectionInViewport = {
            index,
            element: screenContentElements[index]
        };
    };

    const updatePageIndicatorDots = () => {

        const pageIndicatorDots = document.querySelectorAll(".page-indicator-dot");
        pageIndicatorDots.forEach((dotElement, i) => {
            dotElement.className = `page-indicator-dot ${sectionInViewport.index === i ? 'filled' : ''}`;
        });
    };

    const loadAnimalTextStats = () => {
        const squareData = squares[animalStatsIndex];
        addSquares(squareData.numberOnASide, squareData.color);
        updateAnimalStats();
    };

    const handleDownClick = (event) => {
        screenIndex = (screenIndex + 1) % screenContentElements.length;
        const nextScreenId = screenContentElements[screenIndex].id;
        document.getElementById(nextScreenId).scrollIntoView({ behavior: "smooth" });

        const location = window.location.toString().split('#')[0];
        history.replaceState(null, null, location + '#' + nextScreenId);
    };

    const registerDownClickHandler = () => {
        document.getElementById("next-section").addEventListener("click", handleDownClick);
    };

    const registerClickHandlers = () => {
        registerDownClickHandler();
    };

    const init = async () => {

        registerClickHandlers();
        registerMouseHandlers(screenContentElements);
        loadText();
        loadAnimalTextStats();

    };

    init();


})();