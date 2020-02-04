# typing.js
keyboard typing effect plugin [2018]

타이핑 모션 효과를 쉽게 구현하기 위해 플러그인을 개발하였습니다. 
모션 속도/타이밍/지우기/부분 모션 효과 등 옵션 값 설정을 통해 다양한 효과를 구현할 수 있습니다. 

## 사용법
typing.js, style.css 를 import 합니다.

## 호출 코드
```
let km = KM({
      eleId: "input_url",
      letter: ["www.google.recruiter.co.kr"],
      letterTime: 0.04,
      letterDelay: 0.07,
      startDelay: 0.3,
      eraseDelay: 0.3,
      infinite: true,
      callback:function(){
      },
      slice: true,
      sliceLetter: "www.#.recruiter.co.kr",
      sliceInsertLetter: ["inAIR", "naver", "daum", "abcdefg"]
}).init();

또는

km.init(); // 생성 함수
km.destroy(); // 제거 함수 - TweenMax 모션 및 마크업 제거
```    
- eleId: jquery selector object ex) $("#kor_line")
- letter: Array ex) ["text1", "text2" ...]
- letterTime: 한 글자 타이핑하는 모션 시간
- letterDelay: 한 글자 입력 후 다음 글자 타이핑 하는 사이의 딜레이 시간
- startDelay: 모션 시작 딜레이 시간
- eraseDelay: letter.length가 1보다 크면 자동으로 지워지는 모션 후 다음 텍스트 입력 함. 다음 텍스트 입력되기 전 딜레이 시간
- infinite: 무한 반복 실행 여부
- callback: 하나의 텍스트 입력이 완료된 후 실행될 콜백
- slice: 텍스트 일부분만 타이핑 되는지 여부
- sliceLetter: #으로 슬라이스 될 부분을 표시해준다. # 이외의 부분은 타이핑 모션이 적용되지 않고 고정된다.
- slideInsertLetter: Array  #부분에 들어갈 텍스트들의 array임.

# 데모
https://smilejmj.github.io/typing.js/keyboard_plugin.html
