import { Genre } from './types';

export const GENRES: Genre[] = [
  {
    id: 'romance',
    name: '恋愛',
    styleDescription: '情感と共感スタイル',
    artStylePrompt: 'Stunningly beautiful and charismatic character design. Sparkling, expressive eyes, healthy glowing skin, and a fashionable presence. Soft, delicate lines. Bright and warm pastel color palette. Focus on extreme visual appeal and "ikemen/bijin" aesthetics.',
  },
  {
    id: 'school',
    name: '学園もの',
    styleDescription: '青春の日常スタイル',
    artStylePrompt: 'Cool and stylish modern anime style. Characters are attractive, popular-looking students with vibrant energy. Sharp, clean lines. No signs of fatigue. High-end school fashion aesthetics.',
  },
  {
    id: 'business',
    name: 'ビジネス',
    styleDescription: '明快な情報整理スタイル',
    artStylePrompt: 'Sophisticated, sharp, and highly attractive professional style. The character radiates confidence, success, and charisma. Crystal clear skin, no dark circles, perfectly groomed hair. Elegant and expensive-looking business attire.',
  },
  {
    id: 'educational',
    name: '解説・実用書',
    styleDescription: '清潔感のあるエッセイ・解説スタイル',
    artStylePrompt: 'Bright, clean, and extremely likable manga style. The protagonist is a charming "star navigator" with a healthy, beautiful face and an inviting smile. Absolute absence of dark circles or tired eyes. Vibrant and trustworthy aesthetic.',
  },
  {
    id: 'battle',
    name: 'バトル',
    styleDescription: '迫力と分かりやすさ両立スタイル',
    artStylePrompt: 'Heroic and legendary shonen style. Strikingly handsome/beautiful warrior with a powerful aura. Sharp facial features, intense but clear eyes. Epic character design that looks like a high-end action figure.',
  },
  {
    id: 'dark_fantasy',
    name: 'ダークファンタジー',
    styleDescription: 'オカルティック・バトル',
    artStylePrompt: 'Gothic-chic and visually captivating aesthetics. Even in darkness, the character is hauntingly beautiful and charismatic. Mysterious but clear, attractive facial features. Elegant and cool dark fashion.',
  },
  {
    id: 'romance_fantasy',
    name: 'ロマンスファンタジー',
    styleDescription: '悪役令嬢・転生系',
    artStylePrompt: 'Ultra-luxurious and heavenly beautiful style. Beyond-human level of facial beauty. Flowing, silky hair and intricate royal attire. The character is a visual masterpiece of elegance and charm.',
  },
  {
    id: 'sci_fi',
    name: 'SF',
    styleDescription: 'テクノロジー・ヒューマンドラマ',
    artStylePrompt: 'Sleek, futuristic, and exceptionally cool character design. Sharp, attractive features with a high-tech fashion sense. Clean neon accents on a sophisticated silhouette.',
  },
  {
    id: 'slice_of_life',
    name: '日常系',
    styleDescription: 'ライフハック・ハウツー',
    artStylePrompt: 'Soft, warm, and naturally attractive "iyashikei" style. The character looks healthy, cheerful, and charmingly fashionable in casual wear. Clear, bright eyes and a gentle, inviting presence.',
  },
];

export const EXPRESSIONS_TO_GENERATE = ['determined', 'surprised', 'joyful smile'];
