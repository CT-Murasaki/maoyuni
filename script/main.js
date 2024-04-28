exports.main = void 0;

function main(param) {
	g.game.pushScene(makescene(param));
}

function makescene(param) {

    const debugmode = true;

    let scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: [
            "title",
            "font_round",
            "font_round_glyphs",
            "haikei",
            "body1",
            "body2",
            "body3",
            "body4",
            "body5",
            "body6",
            "body7",
            "body8",
			//音声ファイルはhttps://github.com/akashic-contents　CC BY 2.1 JP　DWANGO Co., Ltd.
            "bgm",
            "se_start",
            "se_seikai",
            "se_hazure",
            "se_finish",
	    ]
    });

    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { score: 0 };
    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
        //■■■■■■■■■■■■　 変数　レイヤー　フォント 　■■■■■■■■■■■■

        let gametime = 0; // ゲーム時間測定
        let warmup = 0; //ゲーム開始猶予
        let startstate = false;
        let finishstate = false;
        let score = 0;
        let combo = 0;
        let hitpoint = 10;
        let partsId = 0;
        let Nextparts = 0;
        
        let bodyNo = 1;
        let bodytotal = 6;

        // レイヤーの生成
        let startlayer = new g.E({ scene: scene, parent: scene });  //スタート画面
        let backlayer = new g.E({ scene: scene, parent: scene });   //背景
        let bodylayer = new g.E({ scene: scene, parent: scene });   //体(押すとはずれ)
        let buttonlayer = new g.E({ scene: scene, parent: scene}); //ターゲットレイヤー(映らない)
        
        // フォントの生成
        let glyph1 = JSON.parse(scene.assets["font_round_glyphs"].data);
        let font1 = new g.BitmapFont({src: scene.assets["font_round"],
            map:glyph1,defaultGlyphWidth: 96, defaultGlyphHeight: 96});
        let font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 45
          });

        //タイトル画面
        let startimage = new g.FrameSprite({scene: scene, src: scene.assets["title"], parent: startlayer,
            x: g.game.width/2, y: g.game.height/2, anchorX: 0.5, anchorY: 0.5, opacity: 1, touchable: true});
        //クリックするとスタートするようにする
        startimage.onPointDown.add(function () {if (warmup < 10){
            startstate = true
        }});

        // スコア表示用のラベル
        let scoreLabel = new g.Label({parent: backlayer, scene: scene, text: "SCORE: 0",
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", opacity: 0});
        scene.append(scoreLabel);

        // 残り時間表示用ラベル
        let timeLabel = new g.Label({parent: backlayer,scene: scene,text: "TIME: " + 60, 
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", x: 0.65 * g.game.width,opacity: 0});
        scene.append(timeLabel);

        //背景画像
        let background = new g.FrameSprite({scene: scene, src: scene.assets["haikei"], parent: backlayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0});

        // ターゲット表示用ラベル
        //体
        let backbody = new g.FrameSprite({scene: scene, src: scene.assets["body" + bodyNo], parent: bodylayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0, touchable: false});
        
        //ターゲットラベル
        let t_list = [];
        let t_str = ["","シャツ(左)","シャツ(右)","シャツ(むね)","短パン","ひだりあし","みぎあし","しっぽ"]
        partsId = getrandom(1, 7, -1);
        Nextparts = getrandom(1, 7, partsId);
        let t_int = partsId;
        let t_hp = getrandom(1, 4, -1);
        let Nexthp = getrandom(1, 4, -1);
        t_list[1] = [392,247,121,148] //シャツ(左)
        t_list[2] = [624,247,112,150] //シャツ(右)
        t_list[3] = [495,236,144,158] //シャツ(むね)
        t_list[4] = [469,392,199,163] //短パン
        t_list[5] = [476,554,93,164] //ひだりあし
        t_list[6] = [576,554,93,164] //みぎあし
        t_list[7] = [613,369,158,146] //しっぽ
        let find = new g.FilledRect({scene: scene,x:t_list[t_int][0], y:t_list[t_int][1], width: t_list[t_int][2], height:t_list[t_int][3], 
            cssColor: "black", parent: buttonlayer, opacity: 0});
        scene.append(find);
       
        //体を触ると減点
        backbody.onPointDown.add(function(){
            score -= 50; 
            combo = 0;
            scene.assets["se_hazure"].play().changeVolume(0.6);
        });

        //ターゲットを触るとスコアアップ
        find.onPointDown.add(function(){
            score += 50;
            combo += 1;
            hitpoint -= 1;
            t_hp -= 1;

            if (hitpoint == 0){
                hitpoint = 10;
                bodyNo += 1;
                backbody.src = scene.assets["body" + bodyNo];
            }
            else if (t_hp == 0){
                t_int = Nextparts
                t_hp = Nexthp;
                find.x = t_list[t_int][0]
                find.y = t_list[t_int][1]
                find.width = t_list[t_int][2]
                find.height = t_list[t_int][3]
                Nextparts = getrandom(1, 7, t_int);
                Nexthp = getrandom(1, 4, -1);
            }
            scene.assets["se_seikai"].play().changeVolume(0.6);
        });

        // ターゲット名称ラベルヘッダー
        let TargetHeder = new g.Label({parent: backlayer,scene: scene,text: "Target", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.40 * g.game.height, opacity: 0});
        scene.append(TargetHeder);

        // ターゲット名称ラベル
        let TargetLabel = new g.Label({parent: backlayer,scene: scene,text: getbodyName(t_str[t_int],t_hp), font: font,
            fontSize: font.size , textColor: "black", y: 0.50 * g.game.height, opacity: 0});
        scene.append(TargetLabel);
    
        // 次ターゲット名称ラベルヘッダー
        let NextHerder = new g.Label({parent: backlayer,scene: scene,text: "Next", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.60 * g.game.height, opacity: 0});
        scene.append(NextHerder);

        // 次ターゲット名称ラベル
        let NextLabel = new g.Label({parent: backlayer,scene: scene,text: getbodyName(t_str[Nextparts],Nexthp), font: font,
            fontSize: font.size , textColor: "black", y: 0.70 * g.game.height, opacity: 0});
        scene.append(NextLabel);

        let mainObj = [background,scoreLabel,timeLabel,backbody,
                        TargetHeder,TargetLabel,NextHerder,NextLabel];

        // ■■■■■■■■■■■■　 メイン描画　　■■■■■■■■■■■■
        scene.onUpdate.add(function () {//時間経過
            if (startstate == true && finishstate == false) { 
                gametime += 1 / g.game.fps; 

                startimage.opacity = 0;
                startimage.touchable = false;
                mainObj.forEach(function(Obj){Obj.opacity = 1;});
                if (debugmode == true){find.opacity = 0.5;}
                backbody.touchable = true;
                find.touchable = true;
                TargetLabel.text = getbodyName(t_str[t_int],t_hp);
                NextLabel.text = getbodyName(t_str[Nextparts],Nexthp);

                if (gametime <= 60 && bodyNo != bodytotal){
                    scoreLabel.text = "SCORE: " + score;
                    timeLabel.text = "TIME: " + Math.ceil(60 -gametime);
                }
                else{
                    finishstate = true
                };
            } 
            else if (finishstate == true){
                startstate = false
                backbody.touchable = false;
                find.touchable = false;
                startimage.opacity = 0;
                find.opacity = 0;
                startimage.touchable = false;
                mainObj.forEach(function(Obj){Obj.opacity = 0;});
            }
            else
            {
                warmup += 1 / g.game.fps;
                if (warmup < 15){
                    startimage.opacity = 1;
                }
                else{
                    finishstate = true
                };
            };

            startimage.invalidate();
            find.modified();
            mainObj.forEach(function(Obj){Obj.invalidate();});
        });
    });
    // ここまでゲーム内容を記述します
    return scene;
};

function getrandom(min,max,exc){
    let int = g.game.random.get(min, max);
    while(exc != -1 && exc == int){
        int = g.game.random.get(min, max);
    }
    return int
}

function getbodyName(str,hp){
    let bodyName = str;
    if(hp != 1){
        bodyName = str + "×" + String(hp);
    }
    return bodyName;
}
exports.main = main;
