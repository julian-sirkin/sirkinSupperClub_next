// Base64 encoded icons for email compatibility
const TIKTOK_ICON = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAADJ0lEQVR4nO2UW0xTZxjHv/Z0pz2lPT2XtvScnra0FHoBCgVEqUwFnA7mnDjCvG3RGTbYYWMuuqiJSwwz0zE3p47pNheXuWTJlkX3sBgT9+KSxWTJHrZkD0sWjYmJxujw33da0JbMG7LE5J/88/2/fN/v+fK9vO8H/O+/RCKVSNZKxKIjIpFoVSwWPRYKhZ8JBIKrhHBPCOH+QQhZTAhZQwh5Qy6XH1QoFO/K5bLtcrnsDblctluhkB+QyWQNUql0o1gslv0jQGxMbFxCQvyVxMSEgUQG+xMZPEhk8CgxkT1KYrAvKZl9kJTM3ktKYq8nJSWeTkpOOqBQKN4Si8XSvwVIpdIDiYmJt1NSkntTU1P6U1NT+1PT0u6kpaX2pqenDaSnp/VnZKTfzsjI6MvIzLyZkZnRm5mZ0Z2ZmXlJoVBs+kvlhJDXZTLpKZlMekEmk3bJ5bJLcrnsvFwuPSuXy87I5LKzMpn0nFQqPS+VSi5JJJIuQsgZQsgVQkgnIeQSIaSDEHJRIpF8KxaLrwmFwquEkEuEkC8JIZ8RQk4RQg4RQnYQQjYQQlYTQpYQQnIIIVn/CKBWq1+NiYnZFhMTszU2NnZzbGzsxri4uPVxcXHr4uPj18fHx21ISEhgExMTNyYkJLBqtXqzWq3erFKpNqlUqo0qlWqDSqVaq1Qq31YqlZsUCsU7CoViT3R0dItGo6nSaDTlGo2mRKPRFGo0mnz6VKvVOVqtNlenS8vR6XQ5Op0uW6fTZel0uky9Xp+h1+vT9Xp9ml6fptfpdOl6vT5Dp9NlGgyGLIPBkGkwGDIMBkO6wWBI0+v1qXq9PkWv16eYTKZks9mcZLbbk8xmc6LZbE40mUxJZrM5wWw2x5vN5gSLxRJvsVhiLRZLnNVqjbVarTFWqzXaZrNF22y2KJvNFmm326McDofd4XDYnU5nhNPpjHA6neFOpzPc5XKFuVyuULfbHep2u0M8Hk+wx+MJ8nq9gV6vN8Dr9QZ4vV6b1+u1+Xw+q8/ns/h8PrPP5zP7/X6z3+83BQIBUyAQMAYCgYhAIBAeDAYjgsGgIxgMOoLBoCMUCjlCoZA9FAqFh0KhsHA4bA+Hw7ZwOGz9Df4b+BnVN8DBqXzWZwAAAABJRU5ErkJggg==`;

const INSTAGRAM_ICON = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAADcElEQVR4nO2UXUxTZxjHn/b0tD09/Tzn9JxSWgq0FAqUWWQqMFDUiYkfYWqci+ImF2p0JsZF4xJ1xpipmXHGxF0wkwVjvPLGLJkx0YsZjVkuTIxLvDDGC42JJppoYuR1/31vS8WpYyTxYon/5Mn7Pt/P8+Z5HuB//1GiKKpFIpFBJBJ1i0SiRaFQ+EQgEFwihNwhhNwmhPxNCFlICFlACHlFIBC8KxAIPhQIBLsEAsEOgUDQKRAI2gUCQatAIGgSCoUNIpFI9p8AsbGx8QkJ8RcSExP6Exk8SGTwMJHBo0QGD5IY3E9KYu8lJbHXk5KSziclJR1OSkraJ5fLN4hEIunfAqRS6b7ExMQbKSnJPampKX2pqal3UtNSe9PS0/rSM9L7MzLS72RkpPdlZmbcyszM6M3MzLyZmZnRnZmZeUGhUKz7S+WEkNdkMulxmUx6TiaTXpbLZRfkcvl5uVx2Vi6XnZHJZKdlMukpmUxyRiKRnJVIJF0SieS0WCw+JRaLT4rF4hNisfgbsVh8RSgUXiaEXCSEnCeEfEkIOUoI+YQQsosQspUQsoYQspQQkksIyfpHgFqtfjUmJmZrTEzMlri4uE1xcXEb4+Pj18fHx61LSEhYm5iYuC4xMZFNSkralJSUxKrV6i1qtXqzSqXapFKp1qtUqnUqlWqNSqVarVQq31EqlZuVSuUmpVK5W61Wt2k0mkqNRlOm0WiKNRpNkUajKdRoNAUajSZfq9Xm6nS6HJ1Ol63T6bJ0Ol2mTqfL0Ov16Xq9Pk2v16fp9fo0g8GQbjAYMgwGQ7rBYEgzGAypBoMhxWAwJBsMhiSTyZRoMpmSTCZTotlsTjCbzfFmsznObDbHWiyWWIvFEmOxWKKtVmuU1WqNtNlsEXa7PcJut4fb7fYwh8MR6nA4QpxOZ7DT6QxyuVyBLpcr0O12B3g8Hrvb7bZ7vV6b1+u1er1ei8/ns/h8PrPf7zf5/X6j3+83BAIBQ0NDQ3hjY2NYMBi0B4NBWzAYtIZCIUsoFLKEw2FzOBw2hcNhYzgcNoTDYX04HNaHQiFdKBTShkIhTSgU0oRCIXU4HFaHw2FVQ0ODsqGhQdHQ0CBvaGiQNTY2ShsbGyWNjY1ijUYjbmpqEjU1NQmbm5sFzc3NfE6nk3V2dvI7Ozv5XV1d/K6uLn5PTw+/p6eH39vby+/t7eX19fXxent7eb29vbze3l5uX18ft6+vj/sL/A38BLZPwcHVsNtEAAAAAElFTkSuQmCC`;

const EMAIL_ICON = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAACqElEQVR4nO2UX0xScRTHz4UL93Lv5V4ul3u5/BFhwqQwBAcUzpyPrV5ay/kQtVbNXK2Xsim1KTRTy1rmQ0tNiuZDa1lrtVqrh2prD21ta89tbQ+ttYfW2kNr7ev5wR+U4Uv2h5/t7Ox3z+d3zu/3O+cQ8r8tQRAkPB5vJ4/H28Pj8XYJBIIDQqHwqEgkOiYSiY6KxeJjYrH4qEQiOSKRSA5LpdLDUqn0kFQqPSiVSg/IZLIDMplsv0wm2yeTyXbLZLKdcrm8SSKR1P0TQCwW10ml0jMymeyiXC6/pFAoLioUivMKheKcQqE4q1QqTyuVylNKpfKkUqk8oVKpjqtUqqMqlepbsVh8WSwWX5RIJF+JxeIvCCHnEULnEEKfI4Q+RQgdQQjtQwjtQQhtRwitQwgtQQjlIYQy/wmgVqtf5fP52/h8/hY+n79ZIBBsFAgE6wUCwTqhULhWKBSuEYlEq0UiEatWqzep1erNGo1mk0aj2ajRaNZrNJq1Go1mjUqlWqNSqVarVQq31EqlZuVSuUmpVK5W61Wt2k0mkqNRlOm0WiKNRpNkUajKdRoNAUajSZfq9Xm6nS6HJ1Ol63T6bJ0Ol2mTqfL0Ov16Xq9Pk2v16fp9fo0g8GQbjAYMgwGQ7rBYEgzGAypBoMhxWAwJBsMhiSTyZRoMpmSTCZTotlsTjCbzfFmsznObDbHWiyWWIvFEmOxWKKtVmuU1WqNtNlsEXa7PcJut4fb7fYwh8MR6nA4QpxOZ7DT6QxyuVyBLpcr0O12B3g8Hrvb7bZ7vV6b1+u1er1ei8/ns/h8PrPf7zf5/X6j3+83BAIBQ0NDQ3hjY2NYMBi0B4NBWzAYtIZCIUsoFLKEw2FzOBw2hcNhYzgcNoTDYX04HNaHQiFdKBTShkIhTSgU0oRCIXU4HFaHw2FVQ0ODsqGhQdHQ0CBvaGiQNTY2ShsbGyWNjY1ijUYjbmpqEjU1NQmbm5sFzc3NfE6nk3V2dvI7Ozv5XV1d/K6uLn5PTw+/p6eH39vby+/t7eX19fXxent7eb29vbze3l5uX18ft6+vj/sL/A38BLZPwcHVsNtEAAAAAElFTkSuQmCC`;

export const wrapEmailContent = (content: string, signOff: string = "Best,") => {
  return `
    <div style="
      background-color: #000000;
      color: #ffffff;
      font-family: Arial, sans-serif;
      padding: 40px 20px;
      max-width: 800px;
      margin: 0 auto;
    ">
      <div style="
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.95));
        border: 2px solid #B4945F;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 20px;
      ">
        ${content}
      </div>
      
      <div style="
        color: #B4945F;
        font-style: italic;
        margin: 20px 0;
        padding-left: 20px;
      ">
        ${signOff}
      </div>

      <div style="
        border-top: 2px solid #B4945F;
        padding-top: 20px;
        margin-top: 20px;
        text-align: center;
      ">
        <div style="
          font-size: 18px;
          color: #B4945F;
          margin-bottom: 15px;
        ">
          Julian Sirkin
        </div>
        
        <div style="margin: 20px 0;">
          <a href="https://sirkinsupperclub.com" style="
            display: inline-block;
            background-color: #B4945F;
            color: #000000;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            margin: 10px;
          ">
            Visit Sirkin Supper Club
          </a>
        </div>

        <div style="
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
          text-align: center;
        ">
          <p style="
            color: #B4945F;
            font-size: 14px;
            margin-bottom: 15px;
          ">
            Follow Us
          </p>
          <div style="
            display: inline-block;
            text-align: center;
            width: 100%;
          ">
            <a href="https://www.tiktok.com/@sirkinsupper.club" style="
              color: #B4945F;
              text-decoration: none;
              display: inline-block;
              margin: 5px 10px;
              font-size: 14px;
              border-bottom: 1px solid transparent;
              transition: border-color 0.3s ease;
            ">
              TikTok
            </a>
            <a href="https://www.instagram.com/sirkinsupperclub/" style="
              color: #B4945F;
              text-decoration: none;
              display: inline-block;
              margin: 5px 10px;
              font-size: 14px;
              border-bottom: 1px solid transparent;
              transition: border-color 0.3s ease;
            ">
              Supper Club Instagram
            </a>
            <a href="https://www.instagram.com/sirkinchef" style="
              color: #B4945F;
              text-decoration: none;
              display: inline-block;
              margin: 5px 10px;
              font-size: 14px;
              border-bottom: 1px solid transparent;
              transition: border-color 0.3s ease;
            ">
              Chef's Instagram
            </a>
            <a href="mailto:sirkinsupperclub@gmail.com" style="
              color: #B4945F;
              text-decoration: none;
              display: inline-block;
              margin: 5px 10px;
              font-size: 14px;
              border-bottom: 1px solid transparent;
              transition: border-color 0.3s ease;
            ">
              Email Us
            </a>
          </div>
        </div>

        <div style="
          margin-top: 20px;
          font-size: 12px;
          color: #666666;
        ">
          © ${new Date().getFullYear()} Sirkin Supper Club. All rights reserved.
        </div>
      </div>
    </div>
  `;
}; 