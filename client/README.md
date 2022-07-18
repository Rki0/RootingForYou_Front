# ✨ Front-end

이번에 처음으로 배포해본 모바일 웹에 대한 코드 리뷰를 해보고자 한다.

[배포 관련 Github 보기](https://github.com/Rki0/RootingForYou_Deployed)

## 📂 파일 구조

<img width="167" alt="스크린샷 2022-07-18 오후 10 40 47" src="https://user-images.githubusercontent.com/86224851/179524317-adbca670-9d9c-4a68-abfd-acdcc4eceec2.png">

하위 폴더 내부에 있는 세부 파일은 아래에서 자세하게 다뤄보자.  
이번 프로젝트는 서버부터 프론트까지 모두 제작해보는데 의미를 뒀기 때문에, 프론트쪽에 복잡한 기능을 없다.

## 🗂 src/setupProxy.js

어떻게 보면 이번 프로젝트의 가장 핵심이라고 할 수 있겠다.  
만들어놓은 서버단과 통신하기 위해서는 proxy 서버를 만들어서 CORS 에러를 회피해야한다.  
이 때 필요한 것이 바로 setupProxy.js 이다.(리액트 공식 사이트에서도 이 방법을 권장한다)

```js
// client에서 request를 할 때 target에 있는 곳으로 보내겠다

const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://rootingforyou.herokuapp.com",
      changeOrigin: true,
    })
  );
};
```

필자는 Heroku에 Back-end를 배포했으므로 배포된 사이트의 주소를 target으로 적어줬다.  
참고로 setupProxy.js 파일은 반드시 src 바로 아래에 넣어줘야한다.  
따로 폴더를 만들어서 넣거나 하면 안됨!!!

## 🗂 src/pages/LoginPage.js

pages 폴더에 있는 것들은 사실 axios 통신을 따로 설정해놓은 action을 dispatch 하는 것이 주요 기능이므로 LoginPage.js 만으로 설명을 마치려고 한다.  
필자가 작성한 코드는 다음과 같다.

```js
import styles from "./Loginpage.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../_actions/user_action";

function LoginPage() {
  const [userEmail, setUserEmail] = useState("");

  const [userPswd, setUserPswd] = useState("");

  const changeEmail = (e) => {
    setUserEmail(e.target.value);
  };

  const changePswd = (e) => {
    setUserPswd(e.target.value);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitOccur = (e) => {
    e.preventDefault();

    let body = {
      email: userEmail,
      password: userPswd,
    };

    dispatch(loginUser(body)).then((response) => {
      if (response.payload.loginSuccess) {
        navigate("/");
      } else {
        alert("로그인 실패");
      }
    });

    setUserEmail("");
    setUserPswd("");
  };

  return (
    <div className={styles.topDiv}>
      <form onSubmit={submitOccur}>
        <div className={styles.styledDiv}>
          <label htmlFor="userEmail">이메일</label>
          <input
            type="e-mail"
            placeholder="이메일을 입력해주세요"
            className={styles.userId}
            id="userEmail"
            value={userEmail}
            onChange={changeEmail}
          />
        </div>

        <div className={styles.styledDiv}>
          <label htmlFor="userPswd">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            id="userPswd"
            value={userPswd}
            onChange={changePswd}
          />
        </div>

        <div className={styles.loginBtn}>
          <button type="submit">로그인</button>
        </div>
      </form>

      <Link to="/join" className={styles.joinLink}>
        회원가입
      </Link>
    </div>
  );
}

export default LoginPage;
```

기본적인 골조를 보여주는 코드라서 전체를 가져왔다. 세부적인 내용은 주석을 참고하자!  
우선 input을 통해 state들을 설정하고, 그 것을 body라는 객체로 묶어서 action에 전달한다.  
action은 이 데이터를 가지고 api와 통신해서 해당하는 기능을 수행할 것이다.  
dispatch의 결과를 활용해서 통신 성공과 실패시 반응을 나눠놨고, 성공한다면 navigate를 활용해서 특정 페이지로 강제 이동을 구현했다.(필요한 곳에서만 쓰도록 하자..너무 왔다갔다 하니까 사용해본 지인들이 에러인줄 알았다고 한다)

## 🗂 src/components/SideMenu.js

이번 코드에서는 scss 문법을 더 잘 활용하기 위해 classnames라는 라이브러리를 사용했다.  
메뉴가 펼쳐지면 메뉴바가 펼쳐지는 것을 구현하기 위해, classnames로 사용할 수 있는 cx 메서드를 사용했다.  
active 상태를 toggleBtn의 state(boolean 값)으로 판단해서 펼쳐지면(true) 컴포넌트의 넓이를 증가시켰다.

```js
import classNames from "classnames/bind";
import styles from "./SideMenu.module.scss";
import { GrClose } from "react-icons/gr";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logoutUser } from "../_actions/user_action";

function SideMenu({ toggleBtn, setToggleBtn }) {
  const toggleMenu = () => {
    setToggleBtn(false);
  };

  // SideMenu.module.scss를 styles로 사용하고 있는데 그 것을 안 쓸 수 있게 해줌
  // active 같이 특정 조건에 className이 추가되는 상황에 유용하게 사용 가능
  const cx = classNames.bind(styles);

  const [authData, setAuthData] = useState(false);

  const user = useSelector((state) => state.user);

  useEffect(() => {
    setAuthData(user?.userData?.isAuth);
  }, [user?.userData]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logoutUser()).then((response) => {
      if (response.payload.logoutSuccess) {
        navigate("/");
      } else {
        return alert("로그아웃이 실패했습니다.");
      }
    });
  };

  return (
    <nav className={cx("sideMenu", { active: toggleBtn })}>
      <div className={styles.menuHeader}>
        <button className={styles.closeBtn} onClick={toggleMenu}>
          <GrClose />
        </button>
        <span>메뉴</span>
      </div>

      <ul className={styles.menuList}>
        <li>
          <Link to="/" onClick={toggleMenu} className={styles.linkTag}>
            홈
          </Link>
        </li>
        <li>
          <Link to="/write" onClick={toggleMenu} className={styles.linkTag}>
            글 쓰기
          </Link>
        </li>
        <li>
          <Link to="/mypage" onClick={toggleMenu} className={styles.linkTag}>
            마이페이지
          </Link>
        </li>
        <li>
          <Link to="/login" onClick={toggleMenu} className={styles.linkTag}>
            {authData ? (
              <button onClick={logoutHandler} className={styles.logOutBtn}>
                로그아웃
              </button>
            ) : (
              "로그인"
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default SideMenu;
```

useEffect 부분에서 ?. 으로 적혀있는 코드들이 가끔 보인다.  
이는 Optional Chaining이라고 불리는 문법이다.  
존재 또는 존재하지 않는 요소와 메서드들을 안전하게 접근할 수 있도록 도와주는 것으로, 혹시나 user가 존재하지 않는다면 undefined를 반환하게 된다.  
이를 통해 axios 통신이 조금이라도 느려졌을 경우, 렌더링이 먼저 되버려서 에러가 발생하는 것을 방지했다.  
동일한 이유로 Redux 스토어에 접근하여 가져온 값을 state에 저장하여 쓰고자 한다면, useEffect 내부에서 setState를 진행해서 에러를 사전에 방지했다.

## 🗂 src/hoc/auth.js

이 코드는 유저의 인증 여부를 판단해서 페이지 접근 권한을 정해주기 위한 것이다.  
흐름을 따라서 주석과 함께 읽어보면 이해가 편할 것이다.  
주석의 설명으로 충분히 이해가 가기 때문에, 비중이 없는 코드인걸로 생각할 수 있는데, 전혀 아니다.  
로그인 기능을 구현했다면 반드시 같이 구현해주는게, 프로젝트의 퀄리티를 높여줄 것이다.

```js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authUser } from "../_actions/user_action";

export default function Auth(SpecificComponent, option, adminRoute = null) {
  // option 파라미터
  // 로그인 여부에 따라 접근 가능한 페이지를 구분하는 용도
  // null => 아무나 출입 가능
  // ture => 로그인한 유저만 출입 가능
  // false => 로그인한 유저는 출입 불가능

  // adminRoute 파라미터
  // 관리자인지 일반 유저인지 구분하는 용도
  // null => 일반 유저
  // true => 관리자

  const navigate = useNavigate();

  function AuthenticationCheck(props) {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(authUser()).then((response) => {
        // 로그인 하지 않은 상태에서
        if (!response.payload.isAuth) {
          // 로그인한 유저만 출입 가능한 페이지에 가려고 한다면
          if (option) {
            // 로그인 페이지로 보냄
            navigate("/login");
          }
        } else {
          // 로그인한 상태에서
          // adminRoute가 true인 페이지에 isAdmin이 false인 사람이 접근하려고 한다면
          if (adminRoute && !response.payload.isAdmin) {
            navigate("/");
          } else {
            // 로그인한 유저가 출입 불가능한 페이지에 가려고 할 때
            if (option === false) {
              navigate("/");
            }
          }
        }
      });
    }, []);

    return <SpecificComponent />;
  }

  return AuthenticationCheck;
}
```

이렇게 만든 인증 함수는 다음과 같은 방식으로 사용한다.

## 🗂 src/App.js

```js
import { Route, Routes } from "react-router-dom";
import Auth from "./hoc/auth";
// 이하 import 생략

function App() {
  // 누구나 접근 가능
  const AuthenticHome = Auth(Home, null);
  const AuthenticSearch = Auth(SearchPage, null);
  const AuthenticJustOnePost = Auth(JustOnePost, null);

  // 로그인한 사람만 접근 가능
  const AuthenticWrite = Auth(Write, true);
  const AuthenticMypage = Auth(MyPage, true);
  const AuthenticMyPostpage = Auth(MyPostPage, true);
  const AuthenticChangePswdPage = Auth(ChangePswdPage, true);
  const AuthenticDeleteUserPage = Auth(DeleteUserPage, true);

  // 로그인한 사람은 접근 불가능
  const AuthenticLogin = Auth(LoginPage, false);
  const AuthenticJoin = Auth(JoinPage, false);

  return (
    <Routes>
      <Route path="/" element={<Header />}>
        <Route index element={<AuthenticHome />} />
        <Route path="/write" element={<AuthenticWrite />} />
        <Route path="/mypage" element={<AuthenticMypage />} />
        <Route path="/mypage/mypost" element={<AuthenticMyPostpage />} />
        <Route
          path="/mypage/changepswd"
          element={<AuthenticChangePswdPage />}
        />
        <Route
          path="/mypage/deleteuser"
          element={<AuthenticDeleteUserPage />}
        />
        <Route path="/login" element={<AuthenticLogin />} />
        <Route path="/join" element={<AuthenticJoin />} />
        <Route path="/showdetail/:postid" element={<AuthenticJustOnePost />} />
      </Route>

      <Route path="/" element={<SearchBar />}>
        <Route path="/search" element={<AuthenticSearch />} />
      </Route>
    </Routes>
  );
}

export default App;
```

auth.js를 Auth라는 형태로 사용 중인데, 파라미터로 무엇을 넣어주느냐에 따라서 로그인 여부를 체크하고, 접근을 통제한다.  
이는 비단 로그인 기능뿐만이 아니라, 다른 기능에서도 사용할 수 있을 것 같기 때문에 로직을 잘 기억해두자.

## 🗂 src/\_reducers/user_reducer.js

사실, 이번 프로젝트에서는 Redux를 예전에 진행하던 프로젝트들 만큼 열심히 사용하지는 않았다.  
api 통신을 구현해놓다보니까, DB 연동도 할 수 있게되었고, 굳이 클라이언트 단에서 많은 정보를 저장할 필요가 없는 것 같았다.

```js
import {
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  LOGOUT_USER,
  CHANGE_PASSWORD,
  DELETE_USER,
} from "../_actions/types";

export default function userReducer(state = {}, action) {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loginSuccess: action.payload };

    case REGISTER_USER:
      return { ...state, register: action.payload };

    case AUTH_USER:
      // user_action.js에서 action이 AUTH_USER인 함수가 반환하는 값을 userData에 넣음
      return { ...state, userData: action.payload };

    case LOGOUT_USER:
      return { ...state, logoutSuccess: action.payload };

    case CHANGE_PASSWORD:
      return { ...state, passwordCheckSuccess: action.payload };

    case DELETE_USER:
      return { ...state, deleteUserSuccess: action.payload };

    default:
      return state;
  }
}
```

하지만, 유저 정보는 반드시 저장할 필요가 있었는데, DB 통신에서 열쇠가 되는 값들을 가지고 있었기 때문이다.  
또한, 유저 인증 정보를 판단하기 위해서도 유저 정보를 가지고 있을 필요가 있었다.(매번 페이지를 바꿀 때마다 action을 dispatch해서 유저 정보를 불러올 수는 없으니..)

## 🗂 src/\_actions/user_action.js

필자는 user_action.js에 모든 action을 넣어놨다.  
그러다보니까 코드가 상당히 길어져서(큰 의미는 없다고 생각하지만), 다음 프로젝트에서는 목적이 다른 axios는 따로 분리해서 만들 예정이다.  
그러는 편이 코드 이해에도 도움이 될 것 같다.

```js
// instance baseURL 설정
const instance = axios.create({
  baseURL: "https://rootingforyou.herokuapp.com",
});

// 로그인
export function loginUser(dataToSubmit) {
  // server/index.js에 작성한 라우트와 통신
  const request = instance
    .post("/api/users/login", dataToSubmit, { withCredentials: true })
    .then((response) => response.data);

  return {
    type: LOGIN_USER,
    payload: request,
  };
}
```

코드에서 핵심적인 부분과 기본 구조를 보여주는 부분을 가져와봤다.  
CORS 에러를 회피하기 위해 instance를 생성해서 baseURL을 지정해줬다.  
배포 이전에는 이 설정이 없어도 잘 됐는데, 배포 후에는 이 설정을 꼭 해줘야 문제없이 동작을 했다.  
api 통신을 위해서 axios를 사용했는데, 어느정도 익숙해지기 전까지는 어떤 메서드를 사용해야지 되는지 감이 잡히지 않았다.  
필자는 get, post를 주로 사용했고, 데이터의 삭제나 갱신 등은 DB 쪽에서 진행하도록 코드를 작성했다.  
어떤 것이 더 맞는 코드인지는 아직까지는 알 방법이 없다. 다른 메서드도 사용하는 곳이 분명히 있을텐데...

이렇게 Front 쪽 코드를 살펴보았다.  
파일 개수에 비하면 굉장히 축약해서 설명을 작성해봤는데, 반복적인 내용이 많았기 때문에 이정도면 충분하다고 생각한다.  
더 자세하게 보고싶다면 항상 주석과 코드를 같이 보도록하자.  
개인적으로는 코드의 흐름을 따라서 볼 수 있는 주석을 굉장히 좋아하기 때문에!  
이상으로 Front 코드 설명 종료하겠습니다~🥳
