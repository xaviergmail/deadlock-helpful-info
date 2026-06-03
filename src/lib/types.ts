export interface HeroImages {
  icon_image_small: string;
  icon_image_small_webp: string;
  icon_hero_card: string;
  icon_hero_card_webp: string;
}

export interface Hero {
  id: number;
  name: string;
  class_name: string;
  images: HeroImages;
}
