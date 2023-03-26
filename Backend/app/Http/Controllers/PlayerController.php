<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use App\Http\Requests\PlayerRequest;

class PlayerController extends Controller{


    function readPlayer($id){

        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);

        $id = $player->id;
        $name = $player->name;
        $time = $player->time;
        $score = $player->score;
        $helps = $player->helps;

        return response()->json(["id" => $id, "name" => $name, "score" => $score, "time" => $time, "helps" => $helps], 200, ['Content-Type' => 'application/json'], 0);

    }

    function deleteOldPlayers($players){

        foreach($players as $player){

            if($this->mustBeDeleted($player)){
                $this->deletePlayer($player->id);
            }

        }

    }

    function readAllNamesPlayers(){

        $players = Player::orderBy('name')->get();

        $data = [];

        foreach($players as $player){

            if($this->mustBeDeleted($player)){
                $this->deletePlayer($player->id);
                continue;
            }

            $player = ['id' => $player->id, 'name' => $player->name];

            array_push($data, $player);

        }

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    function readAllPlayers(){

        $players = Player::all();

        $this->deleteOldPlayers($players);

        $data = $this->playerToArray($players);

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    function readAllOrderPlayers(){

        $players = Player::orderBy('score', 'DESC')
                    ->orderBy('time')
                    ->orderBy('helps')
                    ->orderBy('name')
                    ->get();

        $this->deleteOldPlayers($players);

        $data = $this->playerToArray($players);

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    function topPlayer($top = 1){

        $players = Player::orderBy('score', 'DESC')
                    ->orderBy('time')
                    ->orderBy('helps')
                    ->orderBy('name')
                    ->take($top)
                    ->get();

        $data = $this->playerToArray($players);

        if(count($data) == 1) $data = $data[0];

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    function lastPlayer($last = 1){
        $players = Player::orderBy('score')
                    ->orderBy('time')
                    ->orderBy('helps')
                    ->orderBy('name')
                    ->take($last)
                    ->get();

        $data = $this->playerToArray($players);

        if(count($data) == 1) $data = $data[0];

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);
    }

    function rangePlayer($begin, $end){

        $players = Player::skip($begin)
                    ->take($end)
                    ->get();

        $data = $this->playerToArray($players);

        if(count($data) == 1) $data = $data[0];

        return response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    function playerWithNameExists($username){

        return response()->json(['exists' => $this->usernameExists($username), 'name' => $username], 200, ['Content-Type' => 'application/json'], 0);

    }

    function idUsername($username){

        if(!$this->usernameExists($username)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::where('name', $username)->get();

        $player = $player[0];

        return response()->json(['id' => $player->id, 'name' => $username], 200, ['Content-Type' => 'application/json'], 0);

    }

    function connectionTest(){
        return response()->json(['connection' => true], 200, ['Content-Type' => 'application/json'], 0);
    }

    function createPlayer(PlayerRequest $req){

        $name = $req->input('name');
        $time = $req->input('time');
        $score = $req->input('score');
        $helps = $req->input('helps');

        if($this->usernameExists($name)) return response('This username alredy exist', 409)->header('Content-Type', 'text/plain');

        $player = new Player;

        $player->name = $name;
        $player->time = $time;
        $player->score = $score;
        $player->helps = $helps;

        $player->save();

        return response()->json(["id" => $player->id], 200, ['Content-Type' => 'application/json'], 0);

    }

    function hardUpdatePlayer(PlayerRequest $req, $id){

        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);

        $newName = $req->input('name');

        if($player->name != $newName && $this->usernameExists($newName)) return response('This username alredy exist', 409)->header('Content-Type', 'text/plain');

        $player->name = $newName;
        $player->score = $req->input('score');
        $player->time = $req->input('time');
        $player->helps = $req->input('helps');

        $player->save();

        return response()->json(["id" => $player->id], 200, ['Content-Type' => 'application/json'], 0);

    }


    function updatePlayer(PlayerRequest $req, $id){

        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);

        $newName = $req->input('name');

        if($player->name != $newName && $this->usernameExists($newName)) return response('This username alredy exist', 409)->header('Content-Type', 'text/plain');

        $player->name = $newName;

        $newPlayer = new Player;

        $newPlayer->score = $req->input('score');
        $newPlayer->time = $req->input('time');
        $newPlayer->helps = $req->input('helps');


        $player = $this->updateRecords($player, $newPlayer);

        $player->save();

        return response()->json(["id" => $player->id], 200, ['Content-Type' => 'application/json'], 0);

    }


    function hardPatchPlayer(Request $req, $id){
        
        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);

        if($req->input('name') !== null && $player->name != $req->input('name')){

            $newName = $req->input('name');

            if($this->usernameExists($newName)) return response('This username alredy exist', 409)->header('Content-Type', 'text/plain');

            $player->name = $newName;

        }


        $player->time = $req->input('time') ?? $player->time;
        $player->score = $req->input('score') ?? $player->score;
        $player->helps = $req->input('helps') ?? $player->helps;

        $player->save();

        return response()->json(["id" => $player->id], 200, ['Content-Type' => 'application/json'], 0);

    }

    function patchPlayer(Request $req, $id){

        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);
        
        if($req->input('name') !== null && $player->name != $req->input('name')){

            $newName = $req->input('name');

            if($this->usernameExists($newName)) return response('This username alredy exist', 409)->header('Content-Type', 'text/plain');

            $player->name = $newName;

        }

        $newPlayer = new Player;

        $newPlayer->score = $req->input('score') ?? $player->score;
        $newPlayer->time = $req->input('time') ?? $player->time;
        $newPlayer->helps = $req->input('helps') ?? $player->helps;

        $player = $this->updateRecords($player, $newPlayer);

        $player->save();

        return response()->json(["id" => $player->id], 200, ['Content-Type' => 'application/json'], 0);

    }

    private function secureUpdateNullable($currentValue, $newValue){

        if($newValue == null) return false;

        if($newValue > $currentValue) return 1;
        if($newValue < $currentValue) return -1;

        return 0;

    }

    function deletePlayer($id){

        if(!$this->playerExists($id)) return response('This user does not exist', 406)->header('Content-Type', 'text/plain');

        $player = Player::find($id);
        
        $data = ["id" => $player->id, "name" => $player->name, "time" => $player->time, "score" => $player->score, "helps" => $player->helps];

        $player->delete();

        return $this->playerExists($id) ? response('Could not delete user', 500)->header('Content-Type', 'text/plain') : response()->json($data, 200, ['Content-Type' => 'application/json'], 0);

    }

    private function usernameExists($username){

        return count(array_filter(Player::all()->toArray(), fn($n) => $n['name'] == $username)) > 0;

    }

    private function playerExists($id){

        return Player::find($id) != null;

    }

    private function updateRecords(Player $player, Player $newPlayer){

        $score = $newPlayer->score;
        $time = $newPlayer->time;
        $helps = $newPlayer->helps;

        if(intval($score) > intval($player->score)){

            $player->score = $score;
            $player->time = $time;
            $player->helps = $helps;

            return $player;

        }
        
        if(intval($score) == intval($player->score)){


            if(intval($time) < intval($player->time)){
                $player->helps = $helps;
                $player->time = $time;
                return $player;

            }

            $player->helps = intval($helps) < intval($player->helps) ? $helps : $player->helps;

            return $player;

        }

        return $player;

    }

    private function playerToArray($players){

        $data = [];

        foreach($players as $player){

            $player = ['id' => $player->id, 'name' => $player->name, 'score' => $player->score, 'time' => $player->time, 'helps' => $player->helps];

            array_push($data, $player);

        }
        return $data;

    }

    private function mustBeDeleted($player){
        $timestamp = $player->updated_at;
        
        $datePlayer = new \DateTime($timestamp);
        $dateNow = new \DateTime();

        $diff = $datePlayer->diff($dateNow);

        return $diff->days > 7;
    }
}
