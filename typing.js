/* 
 * 키보드 모션 플러그인 시작
 * 호출 형태
	KM({
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
    });
*/
var KM = (function(){
	var Setting = function(option){
		var $this = this;
		$this.eleId = "";
		$this.letter = "테스트입니다.";
		$this.letterTime = 0;												// 문자열 각각 모션 속도						
		$this.letterDelay = 0;											// 문자열 모션 delay			
		$this.startDelay = 0;												// 문자열 시작 모션 delay
		$this.eraseDelay = 0;														// 지워질 때 delay
		$this.cursorEnd = true;									// 커서 표시 여부
		$this.infinite = false;									// 무한 반복
		$this.slice = false;										// slice 사용 여부
		$this.sliceLetter = "";									// slice할 텍스트는 #로 표시
		$this.sliceInsertLetter = [];						// slice 된 영역에 추가될 텍스트
		$this.option = option;

		$.extend($this, $this.option);
		$this.eleId = typeof($this.eleId) != "string" ? $($this.eleId) : $("#"+$this.eleId);
		return $this;
	};

	var fn = Setting.prototype;

	// 초기화
	fn.init = function(){
		var $this = this;
		$this.makeArrLang();
	};

	// 문자열 배열 전환 및 언어 체크
	fn.makeArrLang = function(){
		var $this = this,
			eleId = this.eleId,
			str = this.letter,
			resultArr = [];

		if(typeof(str) == "string"){		// letters 문자열 1개일 때
			resultArr[0] = $this.makeArrLangFunc(str);
		}else{								// letters 문자열 여러 개일 때
			for(var i=0; i<str.length; i++){
				resultArr[i] = [];
				resultArr[i] = $this.makeArrLangFunc(str[i]);
			}
		}

		$this.resultArr = resultArr;
		$this.makeMarkup();
	};


	// 문자열 파싱 및 언어 감별
	fn.makeArrLangFunc = function(letter){
		var $this = this,
			str = letter,
			length = str.length,
			strArr = [];

		for(var i=0; i<length; i++){
			strArr[i] = {};
			strArr[i].str = str.substr(i, 1);

			if(/^[a-zA-Z]+$/i.test(strArr[i].str)){				// 문자열이 영어일 때
				strArr[i].lang = "eng";
			}else if(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+$/i.test(strArr[i].str)){		// 문자열이 한글일 때
				strArr[i].lang = "kor";
				//strArr[i].strArr = Hangul.disassemble(strArr[i].str, true);			// 자음, 모음 분리 - 현재 기능 없으므로 주석처리
			}else{
				strArr[i].lang = "";
			}
		}

		return strArr;
	}

	// 마크업 구조 생성
	fn.makeMarkup = function(){
		var $this = this,
			$ele = $this.eleId,
			strArr = $this.resultArr,
			cursorBool = $this.cursorEnd,
			html = "";

		strArr.forEach(function(v, i){
			html += "<div class='typing_area'>";
			strArr[i].forEach(function(a, j){
				html += "<span class='letter'>"+a.str+"</span>";
			});

			if(cursorBool){
				html += "<span class='cursor'></span>";
			}
			html += "</div>";
		});

		$ele.html(html);
		$this.typingMotionControl();
	}

	// 모션 컨트롤
	fn.typingMotionControl = function(){
		var $this = this;

		if($this.slice){							// 슬라이스 추가되었을 때
			$this.typingSliceMotion();
		}else{
			$this.typingEraseMotion();
		}
	};

	// 문자 여러개일 때 타이핑 입력 모션
	fn.typingEraseMotion = function(){
		var $this = this,
				$ele = $this.eleId,
				$targetTypingArea,
				$letter,
				$cursor;
		var count = $this.resultArr.length,
				curCnt = 0,
				letterLength = 0;				// $targetTypingArea의 .letter length
				i = 0;

		motion();

		function motion(){
			var letterH = 0;

			$targetTypingArea = $ele.find(".typing_area").eq(curCnt);	
			$cursor = $targetTypingArea.find(">span.cursor");
			$letter = $targetTypingArea.find(">span.letter");
			letterLength = $this.resultArr[curCnt].length;

			TweenMax.set($ele.find(".typing_area"), {display:"none"});
			TweenMax.set($targetTypingArea, {display:"block"});

			if($this.cursorEnd){			// 커서 깜빡거림 모션
				TweenMax.set($cursor, {height:$letter.height(), opacity:0});
				TweenMax.to($cursor, 0.3, {opacity:1, repeat:-1, repeatDelay:0.3, yoyo:true, ease:"Quint.easeInOut"});
			}

			for(var i=0; i<letterLength; i++){
				if($letter.eq(i).height() === 0){
					TweenMax.set($letter.eq(i), {height:letterH});
				}else{
					letterH = $letter.eq(i).height();
				}

				TweenMax.to($letter.eq(i), $this.letterTime, {opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*i, onComplete:function(){				// letter 정방향 모션
					if($(this.target).index() === letterLength-1) {
						if(curCnt >= count-1 && $this.infinite === false) return;
						setTimeout(function(){
							for(var j=letterLength-1; j>=0; j--){				// letter 역방향 모션
								if($this.cursorEnd){
									TweenMax.set($cursor, {"left":$letter.eq(j).position().left, "top": $letter.eq(j).position().top, delay:$this.letterDelay*(letterLength-1-j)});
								}
								TweenMax.to($letter.eq(j), $this.letterTime, {opacity:0, ease:"Bounce.easeInOut", delay:$this.letterDelay*(letterLength-1-j)-0.02, onComplete:function(){
									if($(this.target).index() === 0){
										if(curCnt >= count-1){
											if($this.infinite){
												curCnt = 0;
											}else{
												return;
											}
										}else{
											curCnt++;
										}
										setTimeout(function(){
											motion(curCnt);
										}, $this.startDelay*1000);
									}
								}});
							}
						}, $this.eraseDelay*1000);
					}
				}});
				if($this.cursorEnd){
					TweenMax.set($cursor, {"left":$letter.eq(i).position().left + $letter.eq(i).width(), "top":$letter.eq(i).position().top, delay:$this.letterDelay*i});
				}
			}
		}

	};

	// 슬라이스 추가된 타이핑 모션
	fn.typingSliceMotion = function(){
		var $this,
				$ele,
				$targetTypingArea,	
				$cursor,
				$letter;

		var letterLength,				// 첫번째로 입력될 텍스트 길이 
				sliceLetter,				// #이 포함된 잘려질 텍스트 형식
				sliceLetterLng,			// #을 split한 배열 길이
				startLength,				// # 앞에 위치하는 텍스트 길이
				startPoint,					// #이 시작될 지점
				endLength,					// # 뒤에 위치하는 텍스트 길이
				endPoint,						// #이 끝나는 지점
				sliceInsertLetter,	// #자리에 타이핑 될 텍스트 array
				curCnt,							
				curTxt,							
				type; 							// first: #.abcd.co.kr (#이 처음에 있는 경우) / center: ab.#.cd (#이 중간에) / last: abcd.# (#이 마지막에)

		$this = this;
		$ele = $this.eleId;
		$targetTypingArea = $ele.find(".typing_area");
		$cursor = $targetTypingArea.find(">span.cursor");
		$letter = $targetTypingArea.find(">span.letter");

		letterLength = $this.resultArr[0].length;		 	
		sliceLetter = $this.sliceLetter.split("#");
		sliceLetterLng = sliceLetter.length;

		if(!sliceLetter[0]){					// #이 제일 앞에 위치할 때
			type = 'first';
			sliceLetter.splice(0, 1);
			sliceLetterLng = sliceLetter.length;
			startPoint = 0;
			startLength = 0;
			endLength = sliceLetter[sliceLetterLng - 1].length;
			endPoint = letterLength - endLength;
		}else if (!sliceLetter[sliceLetterLng - 1]){		// #이 제일 마지막에 위치할 때
			type = 'last';
			sliceLetter.splice(sliceLetterLng - 1, 1);
			sliceLetterLng = sliceLetter.length;
			startLength = sliceLetter[0].length;
			startPoint = startLength;
			endLength = 0;
			endPoint = letterLength;
		}else{
			type = 'center';
			startLength = sliceLetter[0].length;
			startPoint = startLength;
			endLength = sliceLetter[sliceLetterLng - 1].length;
			endPoint = letterLength - endLength;
		}

		sliceInsertLetter = $this.sliceInsertLetter;				
		curCnt = 0;
		curTxt = $this.letter[0];

		sliceLetter.forEach(function(v, i){
			if(!v) return; // 슬라이스 된 텍스트가 공백일 때
			
			curTxt = curTxt.split(v);
			if(curTxt.length > 1) {
				curTxt.forEach(function(x, j){
					if(!x) curTxt.splice(j, 1);
				});
			}
			curTxt = curTxt[0];
		});
		
		TweenMax.set($ele.find(".typing_area"), {display:"none"});
		TweenMax.set($targetTypingArea, {display:"block"});
		if($this.cursorEnd){			// 커서 깜빡거림 모션
			TweenMax.to($cursor, 0.3, {opacity:1, repeat:-1, repeatDelay:0.3, yoyo:true, ease:"Quint.easeOut"});
		}

		_fullTextMotion();

		// 처음 모션 실행 시 모든 letter 모션 실행
		function _fullTextMotion(){
			for(var i=0; i<letterLength; i++){
				TweenMax.to($letter.eq(i), $this.letterTime, {opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*i, onComplete:function(){				// letter 정방향 모션
					if($(this.target).index() === letterLength-1) {
						setTimeout(function(){
							for(var j=letterLength-1; j>=endPoint; j--){				// letter 역방향 모션
								if($this.cursorEnd){
									TweenMax.set($cursor, {"left":$letter.eq(j).position().left, delay:$this.letterDelay*(letterLength-1-j)});
								}
							}
							_sliceTextMotion();
						}, $this.eraseDelay*1000);
					}
				}});
				if($this.cursorEnd){
					TweenMax.set($cursor, {"left":$letter.eq(i).position().left + $letter.eq(i).width(), delay:$this.letterDelay*i});
				}
			}
		}

		// 자른 단어 안에서 모션 실행
		function _sliceTextMotion(){
			var $target;
			var index, txt, html;

			setTimeout(function(){
				for(var i=endPoint-1; i>=startPoint; i--){
					TweenMax.to($letter.eq(i), $this.letterTime, {opacity:0, ease:"Bounce.easeInOut", delay:$this.letterDelay*(letterLength-1-i)-0.02, onComplete:function(){
						index = $(this.target).index();
						$(this.target).remove();

						if(index === startPoint){
							txt = sliceInsertLetter[curCnt];
							html = "";
							
							for(var j = 0; j<txt.length; j++){
								html += "<span class='letter change' style='display:none;'>"+txt.substr(j, 1)+"</span>";
							}

							if(type === 'first') $letter.eq(endPoint).before(html);
							else $letter.eq(startPoint-1).after(html);

							$letter = $targetTypingArea.find(".letter");
							letterLength = $letter.length;
							endPoint = letterLength - endLength;

							for(var k=0; k<txt.length; k++){
								TweenMax.to($letter.eq(k+startPoint), $this.letterTime, {display:"inline", opacity:1, ease:"Quint.easeInOut", delay:$this.letterDelay*k, onComplete:function(){
									$target = $(this.target);
									TweenMax.set($cursor, {"left":$target.position().left + $target.width()});
									if($target.index() === startPoint + txt.length-1){
										if(curCnt === sliceInsertLetter.length - 1){
											curCnt = 0;
										}else{
											curCnt++;
										}
										_sliceTextMotion();
									}
								}});
							}
						}
					}});
					if($this.cursorEnd){
						TweenMax.set($cursor, {"left":$letter.eq(i).position().left, delay:$this.letterDelay*(letterLength-1-i)});
					}
				}
			}, $this.eraseDelay*1000);
		}

	};

	// destroy
	fn.destroy = function() {
		var $this = this;
		var $typingArea = $this.eleId.find('.typing_area');
		var $letter = $typingArea.find('.letter');
		var $cursor = $typingArea.find('.cursor');
		
		TweenMax.killTweensOf($this.eleId);
		TweenMax.killTweensOf($typingArea);
		TweenMax.killTweensOf($letter);
		TweenMax.killTweensOf($cursor);

		$this.eleId.empty();
	};

	return function(option) {
		var setting = new Setting(option);
		return setting;
	};
})();