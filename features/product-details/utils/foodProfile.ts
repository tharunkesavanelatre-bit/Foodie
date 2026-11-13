import type { Meal, FoodProfile } from "../types";

export function getFoodProfile(recipe: Meal): FoodProfile {
  const name = recipe.strMeal.toLowerCase();
  const category = (recipe.strCategory || "").toLowerCase();
  const area = recipe.strArea || "Different regional cuisines";

  if (name.includes("biryani")) {
    return {
      title: "The Story Behind Biryani",
      origin:
        "Biryani is strongly associated with the Indian subcontinent. Hyderabad, Lucknow, Kolkata and other regions are famous for their distinctive biryani styles.",
      background:
        "Biryani brings together aromatic rice, spices and carefully prepared ingredients. Different regions have developed their own versions, with variations in rice, seasoning and cooking techniques.",
      preparation:
        "The preparation often begins with washing and soaking rice. Meat or vegetables are seasoned separately, while aromatic spices develop the base flavour. The rice and prepared ingredients are then layered or combined and cooked until their flavours come together.",
      ingredients:
        "Rice provides the foundation of the dish. Whole spices, herbs, onions and other seasonings contribute aroma and depth.",
      stages: [
        "Rice is washed and soaked before cooking to help achieve a suitable texture.",
        "Spices, onions and herbs are prepared to build the aromatic flavour base.",
        "The main ingredients are seasoned and cooked with the selected spices.",
        "Rice and the prepared ingredients are layered or combined according to the regional style.",
        "The dish is cooked until the rice is tender and the flavours are well combined.",
      ],
      flavour:
        "Biryani is known for its aromatic spices, fragrant rice and combination of savoury, herbal and mildly sweet notes.",
      culture:
        "Hyderabadi, Lucknowi and Kolkata biryani are among the best-known regional varieties. Biryani is commonly served at celebrations and special occasions.",
      cookingMethod: "Rice cooking and aromatic layering",
    };
  }

  if (
    /rice|pulao|pilaf|risotto|fried rice/.test(name) ||
    category.includes("rice")
  ) {
    return {
      title: "The World of Rice Dishes",
      origin:
        "Rice dishes are popular across Asia, the Middle East, Europe and many other regions.",
      background:
        "Rice is a versatile staple that absorbs flavours from spices, vegetables, sauces and other ingredients.",
      preparation:
        "Rice is cleaned and prepared before cooking. Depending on the dish, it may be boiled separately, cooked with a seasoned liquid or stir-fried with other ingredients.",
      ingredients:
        "Rice is the main ingredient, while vegetables, herbs, spices, sauces and proteins provide additional flavour and texture.",
      stages: [
        "Rice is selected and cleaned to prepare it for cooking.",
        "Vegetables, herbs and other ingredients are cut and arranged.",
        "Spices, sauces or aromatic ingredients are prepared.",
        "Rice is cooked using the method suitable for the dish.",
        "The remaining ingredients are combined with the rice.",
      ],
      flavour:
        "Rice dishes can range from mild and fragrant to spicy, savoury or creamy.",
      culture:
        "Rice has an important place in everyday meals and traditional celebrations across many countries.",
      cookingMethod: "Boiling, steaming or stir-frying",
    };
  }

  if (name.includes("pizza")) {
    return {
      title: "The Story Behind Pizza",
      origin:
        "Modern pizza is especially associated with Naples, Italy, where traditional Neapolitan pizza became famous.",
      background:
        "Pizza is built around a dough base topped with sauce, cheese and other ingredients.",
      preparation:
        "The dough is prepared and allowed to rise. Sauce, cheese and toppings are arranged over the base before baking.",
      ingredients:
        "Flour, yeast, water and salt form the dough. Tomato sauce, cheese, vegetables, herbs and optional meat provide the toppings.",
      stages: [
        "Flour, yeast, water and salt are combined to form the dough.",
        "The dough is kneaded and allowed to rise.",
        "The dough is shaped into a pizza base.",
        "Sauce, cheese and selected toppings are arranged over the base.",
        "The pizza is baked until the crust is cooked and the cheese melts.",
      ],
      flavour:
        "Pizza combines a soft or crisp crust with savoury sauce, melted cheese and toppings.",
      culture:
        "Naples is famous for traditional Neapolitan pizza, which has influenced pizza styles around the world.",
      cookingMethod: "Dough preparation and oven baking",
    };
  }

  if (/pasta|spaghetti|macaroni|lasagna|penne|fettuccine/.test(name)) {
    return {
      title: "Discover the World of Pasta",
      origin:
        "Pasta is closely associated with Italian cuisine, which has developed many regional pasta shapes, sauces and preparation traditions.",
      background:
        "Pasta comes in different shapes and sizes. Each shape works with different sauces and ingredients.",
      preparation:
        "Pasta is cooked in water until it reaches the desired texture. Meanwhile, a sauce is prepared and combined with the cooked pasta.",
      ingredients:
        "Pasta forms the base, while sauces, herbs, vegetables, cheese and optional meat create the character of the dish.",
      stages: [
        "The pasta shape is selected according to the dish.",
        "Water is heated and the pasta is cooked.",
        "The sauce is prepared using the selected ingredients.",
        "The cooked pasta is combined with the sauce.",
        "Herbs, cheese or other finishing ingredients complete the dish.",
      ],
      flavour:
        "Pasta can be creamy, tangy, cheesy, savoury or herbaceous depending on the sauce.",
      culture:
        "Italy is famous for its regional pasta traditions and distinctive shapes and sauces.",
      cookingMethod: "Boiling and sauce preparation",
    };
  }

  if (name.includes("burger")) {
    return {
      title: "What Makes a Burger Special?",
      origin:
        "The modern hamburger is strongly associated with the United States, with influences from other food traditions.",
      background:
        "A burger combines a bread bun with a filling and selected toppings.",
      preparation:
        "The patty is prepared and cooked, while the bun and toppings are arranged separately. The ingredients are assembled before serving.",
      ingredients:
        "A bun provides the base. The filling may include a meat or vegetable patty, cheese, lettuce, tomato, onion and sauces.",
      stages: [
        "The patty mixture or selected filling is prepared.",
        "The patty is shaped and seasoned.",
        "The patty is cooked until ready.",
        "The bun is prepared and lightly toasted when required.",
        "The patty, vegetables, cheese and sauces are assembled.",
      ],
      flavour:
        "Burgers bring together soft bread, a savoury filling, fresh vegetables and sauces.",
      culture:
        "Burgers are a popular part of American fast-food culture and have developed many international variations.",
      cookingMethod: "Grilling, pan-frying and assembly",
    };
  }

  if (
    /fish|prawn|shrimp|crab|lobster|salmon|tuna|squid|octopus|mussel|oyster/.test(name) ||
    category.includes("seafood")
  ) {
    return {
      title: "Discover the Seafood Tradition",
      origin:
        `${area} has its own seafood traditions. Fish and shellfish dishes vary according to local ingredients and cooking methods.`,
      background:
        "Seafood dishes use fish, shellfish or other marine ingredients as their main component.",
      preparation:
        "The seafood is cleaned and prepared before cooking. Seasonings, herbs and sauces are arranged according to the dish.",
      ingredients:
        "Fish or shellfish provides the main ingredient. Herbs, spices, citrus, vegetables and sauces develop the flavour.",
      stages: [
        "The seafood is cleaned and prepared.",
        "Herbs, spices and other seasonings are arranged.",
        "The seafood is seasoned according to the recipe.",
        "The selected cooking method is used to prepare the seafood.",
        "Sauces, herbs or finishing ingredients complete the dish.",
      ],
      flavour:
        "Seafood can have a delicate, savoury or rich flavour depending on the variety and seasonings.",
      culture:
        "Coastal communities around the world have developed distinctive seafood dishes.",
      cookingMethod: "Grilling, steaming, frying or simmering",
    };
  }

  if (name.includes("chicken") || category.includes("chicken")) {
    return {
      title: "The Preparation Behind Chicken Dishes",
      origin:
        `${area} offers its own chicken preparations, with different spice combinations, sauces and cooking techniques.`,
      background:
        "Chicken is a versatile ingredient used in many cuisines.",
      preparation:
        "The chicken is cleaned and cut into suitable portions. It may be seasoned or marinated before being cooked.",
      ingredients:
        "Chicken is the main ingredient. Onions, garlic, ginger, herbs, spices and sauces contribute additional flavour.",
      stages: [
        "The chicken is cleaned and divided into suitable portions.",
        "Spices, herbs and other seasoning ingredients are prepared.",
        "The chicken is seasoned or marinated when required.",
        "The chicken is cooked using the method suited to the dish.",
        "The sauce, herbs or finishing ingredients complete the preparation.",
      ],
      flavour:
        "Chicken dishes can be mild, spicy, creamy, smoky or aromatic.",
      culture:
        "Chicken dishes are popular across many food cultures, with regional variations.",
      cookingMethod: "Grilling, roasting, frying or simmering",
    };
  }

  if (category.includes("salad") || name.includes("salad")) {
    return {
      title: "Freshness Behind Every Salad",
      origin:
        `${area} has its own salad traditions, using seasonal vegetables, fruits, herbs and dressings.`,
      background:
        "Salads bring together fresh or prepared ingredients in different combinations.",
      preparation:
        "Vegetables and other ingredients are cleaned and cut. A dressing is prepared separately and combined with the ingredients.",
      ingredients:
        "Fresh vegetables, fruits, herbs, grains, nuts and dressings may be used.",
      stages: [
        "Fresh ingredients are selected and cleaned.",
        "Vegetables and fruits are cut into suitable portions.",
        "Herbs, toppings and other ingredients are prepared.",
        "A dressing is mixed using the selected ingredients.",
        "Everything is combined and arranged for serving.",
      ],
      flavour:
        "Salads often balance crisp textures, fresh flavours, natural sweetness and tangy dressings.",
      culture:
        "Salads are enjoyed in many cuisines, from Mediterranean vegetable salads to Asian-style combinations.",
      cookingMethod: "Fresh preparation and ingredient mixing",
    };
  }

  if (
    category.includes("dessert") ||
    /cake|ice cream|pudding|brownie|cookie|mousse|tart|pie/.test(name)
  ) {
    return {
      title: "The Sweet Story Behind This Dessert",
      origin:
        `${area} has its own dessert traditions, ingredients and methods of preparation.`,
      background:
        "Desserts bring together ingredients such as flour, sugar, milk, cream, fruits and chocolate.",
      preparation:
        "The ingredients are measured and prepared according to the dessert type. They are mixed, cooked, baked or chilled as needed.",
      ingredients:
        "Ingredients may include flour, sugar, milk, cream, eggs, fruits, chocolate and flavourings.",
      stages: [
        "The required ingredients are measured and prepared.",
        "Dry and wet ingredients are combined when required.",
        "The mixture is cooked, baked, chilled or set.",
        "The prepared dessert is allowed to reach the required texture.",
        "The final presentation is completed with suitable toppings.",
      ],
      flavour:
        "Desserts can combine sweetness, creaminess, fruitiness and rich flavours.",
      culture:
        "Desserts are part of celebrations and everyday food traditions across the world.",
      cookingMethod: "Mixing, baking, chilling or setting",
    };
  }

  if (category.includes("soup") || name.includes("soup")) {
    return {
      title: "How This Soup Comes Together",
      origin:
        `${area} has its own soup traditions, using local vegetables, herbs, spices and broths.`,
      background:
        "Soup combines ingredients in a liquid base to develop flavour and texture.",
      preparation:
        "The vegetables and other ingredients are prepared before being added to the broth or cooking liquid.",
      ingredients:
        "Vegetables, herbs, spices, stock, water and optional meat or dairy products may be used.",
      stages: [
        "Vegetables and other ingredients are cleaned and cut.",
        "A broth or seasoned liquid is prepared.",
        "The ingredients are added to the cooking liquid.",
        "Everything is simmered until the ingredients are cooked.",
        "Seasoning and finishing ingredients complete the soup.",
      ],
      flavour:
        "Soups can be light, savoury, spicy, creamy or rich.",
      culture:
        "Soup is enjoyed in many cultures, from traditional broths to regional vegetable and seafood soups.",
      cookingMethod: "Simmering and slow cooking",
    };
  }

  return {
    title: `Discover ${recipe.strMeal}`,
    origin: recipe.strArea
      ? `${recipe.strMeal} is associated with ${recipe.strArea} cuisine. The region's food traditions help shape the ingredients and preparation style of this dish.`
      : "This dish can be explored through its ingredients, food category and preparation method.",
    background:
      `${recipe.strMeal} belongs to the ${recipe.strCategory || "food"} category. Its character comes from the combination of ingredients and the way they are prepared.`,
    preparation:
      `The ingredients for ${recipe.strMeal} are prepared according to the recipe. They are then combined and cooked using the method described in the original preparation.`,
    ingredients:
      "The ingredients listed below form the foundation of this dish. Each ingredient contributes its own flavour, texture or aroma.",
    stages: [
      "The ingredients are selected and prepared.",
      "The required vegetables, herbs and seasonings are arranged.",
      "The main ingredients are combined according to the recipe.",
      "The dish is cooked using the required preparation method.",
      "The final ingredients and seasonings complete the dish.",
    ],
    flavour:
      `The flavour of ${recipe.strMeal} depends on its ingredients, seasoning and cooking method.`,
    culture: recipe.strArea
      ? `${recipe.strArea} cuisine includes different traditional dishes and preparation styles. This recipe represents one part of that culinary variety.`
      : "Food traditions differ between regions, and recipes often reflect local ingredients and preparation styles.",
    cookingMethod: "Recipe-specific preparation",
  };
}

// ==========================================
