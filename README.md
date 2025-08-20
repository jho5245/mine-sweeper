# Minesweeper Web
브라우저 기반 지뢰찾기. 커스텀 보드(게임 크기/지뢰 개수)와 타이머(999초 제한), 게임오버 오버레이 제공

## 데모
![alt text](image.png)  

## 주요 기능
- 게임 모드/게임 크기/지뢰 개수 설정 → 시작 버튼으로 즉시 시작
- 좌클릭: 열기, 우클릭: 깃발 설치/회수
- 999초 경과 시 자동 게임 오버
- 게임 종료 오버레이에서 재시작/살펴보기

## 기술 스택
 - HTML/CSS/Vanilla JS(모듈 없음)

## 폴더 구조
### UI 골격
index.html
### 90s 스타일 스킨(버튼/타일/오버레이)  
assets/css/style.css
### 보드 생성/타일 이벤트/타이머/게임 오버 동작
assets/js/script.js
### 스프라이트(시작/깃발/지뢰)  
assets/images/


## 자료 출처
지뢰찾기 스프라이트 이미지 출처  
https://www.pixilart.com/  

깃발 이미지 출처  
https://www.flaticon.com/kr/free-icon/flag_1529146  

전반적인 구조, 자바스크립트 참고  
https://blog.naver.com/pjt3591oo/223300328033